const axios = require("axios");
const { load } = require("cheerio");
const { config } = require("./helpers");
const {
  amazonQuantitySelector1,
  amazonQuantitySelector2,
  amazonPriceSelector,
  timer,
} = require("./helpers");
const Product = require("../../product/class");
const scrapingAntUrl =
  "https://api.scrapingant.com/v1/general?browser=false&proxy_country=US&url=";

async function fetchProducts(productIds, updateQuery) {
  const { custom } = updateQuery;
  let updates = [];
  let retryIndices = [];
  let productIdsLength = productIds.length;

  let merchantUrl;
  switch (updateQuery.merchant) {
    case "amazon":
      merchantUrl = "https://www.amazon.com/dp/";
      break;
    default:
      throw Error("merchant not recognized");
  }

  try {
    const cookies = await fetchMerchantCookies(
      merchantUrl,
      productIds.length,
      config
    );

    for (let i = 0; i < productIdsLength; i++) {
      let idx = i;

      // if productIdsLength is bigger than productIds argument
      if (productIds[idx] === undefined) {
        idx = retryIndices[idx - productIds.length];
        console.log(`retry product: ${updateQuery.startRow + idx}`);
      }

      const productId = productIds[idx];

      if (isValidProductId(productId) === false) {
        updates[idx] = new Product();
        continue;
      }

      const content = await fetchMerchantProduct(
        merchantUrl,
        productId[0],
        cookies,
        config
      );

      let { quantity, price } = selectHtmlElements(
        updateQuery.merchant,
        content
      );

      if (custom.includes("retries")) {
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
      await timer(400 * (1 + Math.random()));
    }

    console.log(`retried (products): ${retryIndices.length}`);
    return updates;
  } catch (error) {
    console.log(error);
    if (updates.length > 0) {
      return updates;
    } else {
      console.log(error);
      throw Error("could not fetch products. try again later.");
    }
  }
}

function isValidProductId(productId) {
  return Array.isArray(productId) === false || productId[0] == undefined
    ? false
    : true;
}

function selectHtmlElements(merchant, content) {
  const $ = load(content || "");
  let quantity;
  let price;
  switch (merchant) {
    case "amazon":
      quantity =
        $(amazonQuantitySelector1).length != 0
          ? $(amazonQuantitySelector1).children().length
          : $(amazonQuantitySelector2).children().length;

      price = $(amazonPriceSelector).html();
      break;
    default:
      throw Error("merchant not recognized");
  }
  return { quantity, price };
}

async function fetchMerchantProduct(merchantUrl, productId, cookies, config) {
  let url = scrapingAntUrl + merchantUrl + productId;

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
      throw error;
    }
  }
}

async function fetchMerchantCookies(merchantUrl, productCount, config) {
  // cookies to avoid scrape detection

  if (productCount < 5) {
    return;
  }

  try {
    const {
      data: { cookies },
    } = await axios.get(`${scrapingAntUrl}${merchantUrl}`, config);
    return encodeURIComponent(cookies);
  } catch (error) {
    console.log(error);
    throw Error(error);
  }
}

module.exports = fetchProducts;
