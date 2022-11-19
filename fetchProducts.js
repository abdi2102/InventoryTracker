const axios = require("axios");
const cheerio = require("cheerio");
const { productUrl, config } = require("./appHelpers");
const {
  quantitySelector1,
  quantitySelector2,
  priceSelector,
  timer,
} = require("./appHelpers");
const Product = require("./product");

async function fetchProducts(productIds) {
  let updates = [];

  try {
    const cookies = await fetchMerchantCookies(
      productUrl,
      config,
      productIds.length
    );

    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];

      if (isvalidProductId(productId) === false) {
        updates.push(new Product());
        continue;
      }

      const sanitizedProductId = productId[0].trim();
      const content = await fetchMerchantProduct(sanitizedProductId, cookies);

      let { quantity, price } = selectHtmlElements(content);

      if (quantity < 5 || price == null) {
        updates.push(new Product());
        continue;
      }

      let product = new Product((availability = "in stock"), quantity, price);
      product.markup();
      updates.push(product);

      await timer(500 * (1 + Math.random()));
    }

    return updates;
  } catch (error) {
    if (updates.length > 0) {
      return updates;
    } else {
      throw error;
    }
  }
}

function isvalidProductId(productId) {
  if (Array.isArray(productId) === false || productId[0] == undefined) {
    return false;
  }
  return true;
}

function selectHtmlElements(content) {
  const $ = cheerio.load(content);

  let quantity =
    $(quantitySelector1).length != 0
      ? $(quantitySelector1).children().length
      : $(quantitySelector2).children().length;

  let price = $(priceSelector).html();

  return { quantity, price };
}

async function fetchMerchantProduct(productId, cookies) {
  let url = `${productUrl}${productId}`;

  if (cookies) {
    url += `&cookies=${cookies}`;
  }

  try {
    const {
      data: { content },
    } = await axios.get(url, config);

    return content;
  } catch (error) {
    throw error;
  }
}

async function fetchMerchantCookies(mainAmazonUrl, config, productCount) {
  // cookies to avoid scrape detection

  try {
    if (productCount < 5) {
      return;
    }

    const {
      data: { cookies },
    } = await axios.get(mainAmazonUrl, config);

    return encodeURIComponent(cookies);
  } catch (error) {
    throw Error(error);
  }
}

module.exports = fetchProducts;
