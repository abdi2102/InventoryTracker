const axios = require("axios");
const { load } = require("cheerio");
const config = {
  headers: {
    "x-api-key": process.env.SCRAPING_ANT_X_API_KEY,
    useQueryString: true,
  },
};
const timer = function (ms) {
  return new Promise(function (res) {
    return setTimeout(res, ms);
  });
};
const Product = require("../product/class");
const scrapingAntUrl =
  "https://api.scrapingant.com/v1/general?browser=false&proxy_country=US&url=";

async function fetchProducts(productIds, updateQuery, start) {
  const { custom, merchant, template } = updateQuery;
  let updates = [];
  let retryIndices = [];
  let productIdsLength = productIds.length;

  let merchantUrl;
  switch (merchant) {
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
        console.log(`retry product: ${start + idx}`);
      }

      const productId = productIds[idx];

      if (isValidProductId(productId) === false) {
        console.log(`${productId} is not a valid product ID`);
        updates[idx] = new Product(template);
        continue;
      }

      const content = await fetchMerchantProduct(
        merchantUrl,
        productId[0],
        cookies,
        config
      );

      let { productIsInStock, quantity, price } = scrapeMerchantProduct(
        merchant,
        content
      );

      if (productIsInStock === false) {
        updates[idx] = new Product(template);

        if (custom["retries"] === true) {
          if (retryIndices.includes(idx) === false) {
            retryIndices.push(idx);
            productIdsLength += 1;
          }
        }
        continue;
      }

      const product = new Product(
        template,
        (availability = "in stock"),
        quantity,
        price
      );
      product.markupPrice();
      updates[idx] = product;
      await timer(175 * (1 + Math.random()));
    }

    if (custom["retries"] === true) {
      console.log(`retried (products): ${retryIndices.length}`);
    }

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

function scrapeMerchantProduct(merchant, content) {
  const $ = load(content || "");
  let quantity;
  let price;
  let productIsInStock;
  switch (merchant) {
    case "amazon":
      const amazonQuantitySelector1 = "select#quantity";
      const amazonQuantitySelector2 = "select#rcxsubsQuan";
      const amazonPriceSelector = "div#corePrice_feature_div span.a-offscreen";

      quantity =
        $(amazonQuantitySelector1).length != 0
          ? $(amazonQuantitySelector1).children().length
          : $(amazonQuantitySelector2).children().length;

      price = $(amazonPriceSelector).html();

      productIsInStock = quantity < 5 || price == null ? false : true;

      break;
    default:
      throw Error("merchant not recognized");
  }
  return { productIsInStock, quantity, price };
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
    throw Error(error);
  }
}

module.exports = fetchProducts;
