const axios = require("axios");
const { load } = require("cheerio");
const { productUrl, config } = require("./helpers");
const {
  quantitySelector1,
  quantitySelector2,
  priceSelector,
  timer,
} = require("./helpers");
const Product = require("../../product/class");

async function fetchProducts(productIds, options) {
  let updates = [];
  let retryIndices = [];
  let productIdsLength = productIds.length;

  try {
    const cookies = await fetchMerchantCookies(
      productUrl,
      productIds.length,
      config
    );

    for (let i = 0; i < productIdsLength; i++) {
      let idx = i;

      // if productIdsLength is bigger than productIds argument
      if (productIds[idx] === undefined) {
        idx = retryIndices[idx - productIds.length];
        console.log(`retry product: ${options.startRow + idx}`);
      }

      const productId = productIds[idx];

      if (isValidProductId(productId) === false) {
        updates[idx] = new Product();
        continue;
      }

      const content = await fetchMerchantProduct(productId[0], cookies, config);

      let { quantity, price } = selectHtmlElements(content);

      if (options.retries) {
        // failed fetch
        if (quantity < 1 && price == null) {
          updates[idx] = new Product();

          if (retryIndices.includes(idx) === false) {
            retryIndices.push(idx);
            productIdsLength += 1;
          }

          continue;
        }
      }

      if (quantity < 5 || quantity === null) {
        // product is likely out of stock
        updates[idx] = new Product();
        continue;
      }

      const product = new Product("in stock", quantity, price);
      product.markupPrice();
      updates[idx] = product;

      if (options.updateAll) {
        await timer(500 * (1 + Math.random()));
      } else {
        await timer(375 * (1 + Math.random()));
      }
    }

    console.log(`retried (products): ${retryIndices.length}`);
    return updates;
  } catch (error) {
    console.log(error);
    if (updates.length > 0) {
      return updates;
    } else {
      throw Error("could not fetch products. try again later.");
    }
  }
}

function isValidProductId(productId) {
  return Array.isArray(productId) === false || productId[0] == undefined
    ? false
    : true;
}

function selectHtmlElements(content) {
  const $ = load(content || "");

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
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;

      if (status === 423 || status === 403) {
        // requests after are doomed to fail with these statuses
        throw Error(statusText);
      }

      return undefined;
    } else {
      throw Error(error);
    }
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

module.exports = fetchProducts;
