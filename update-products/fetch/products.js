const axios =require("axios");
const { load } = require("cheerio");
const { productUrl, config } = require("./helpers")
const { quantitySelector1, quantitySelector2, priceSelector, timer } = require("./helpers");
const Product = require("../../product/class");

async function fetchProducts(productIds) {
  let updates = [];

  try {
    const cookies = await fetchMerchantCookies(
      productUrl,
      productIds.length,
      config
    );

    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];

      if (isValidProductId(productId) === false) {
        updates.push(new Product());
        continue;
      }

      const content = await fetchMerchantProduct(productId[0], cookies, config);

      let { quantity, price } = selectHtmlElements(content);

      if (quantity < 5 || price == null) {
        updates.push(new Product());
        continue;
      }

      const product = new Product("in stock", quantity, price);
      product.markupPrice();
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

function isValidProductId(productId)  {
  return Array.isArray(productId) === false || productId[0] == undefined
    ? false
    : true;
}

function selectHtmlElements(content) {
  const $ = load(content);

  let quantity =
    $(quantitySelector1).length != 0
      ? $(quantitySelector1).children().length
      : $(quantitySelector2).children().length;

  let price = $(priceSelector).html();

  return { quantity, price };
}

async function fetchMerchantProduct(productId, cookies, config) {
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

async function fetchMerchantCookies(mainAmazonUrl, productCount, config) {
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


module.exports = fetchProducts