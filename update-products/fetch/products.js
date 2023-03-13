// program stops when internet connection is terminated

// AxiosError: read ECONNRESET
//     at TLSWrap.onStreamRead (node:internal/stream_base_commons:217:20) {
//   syscall: 'read',
//   code: 'ECONNRESET',
//   errno: -54,
//     headers: {
//       Accept: 'application/json, text/plain, */*',
//       'x-api-key': 'aacf5794c3394314915f4932ef412cdd',
//       useQueryString: true,
//       'User-Agent': 'axios/0.27.2'
//     },
//     method: 'get',
//     url: 'https://api.scrapingant.com/v1/general?browser=false&proxy_country=US&url=https://www.amazon.com/dp/B07PCPBX46&cookies=session-id%3D143-1296729-4462841%3Bsession-id-time%3D2082787201l%3Bi18n-prefs%3DUSD%3Bsp-cdn%3D%22L5Z9%3AGB%22%3Bubid-main%3D131-5699832-8008128%3Bskin%3Dnoskin',
//     data: undefined

// Error: AxiosError: Request failed with status code 500
//     at fetchMerchantCookies (/Users/abdi/amz-inventory-tracker/update-products/fetch/products.js:184:11)
//     at processTicksAndRejections (node:internal/process/task_queues:96:5)
//     at async fetchProducts (/Users/abdi/amz-inventory-tracker/update-products/fetch/products.js:34:21)
//     at async submitUpdates (/Users/abdi/amz-inventory-tracker/update-products/express/middlewares.js:45:23)
// Error: could not fetch products. try again later.
//     at fetchProducts (/Users/abdi/amz-inventory-tracker/update-products/fetch/products.js:107:13)
//     at processTicksAndRejections (node:internal/process/task_queues:96:5)
//     at async submitUpdates (/Users/abdi/amz-inventory-tracker/update-products/express/middlewares.js:45:23)

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
        console.log(`retry product: ${start + idx}`);
      }

      const productId = productIds[idx];

      if (isValidProductId(productId) === false) {
        console.log(`${productId} is not a valid product ID`);
        updates[idx] = new Product((template = updateQuery.template));
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
        if (quantity < 5 || price == null) {
          updates[idx] = new Product((template = updateQuery.template));

          if (retryIndices.includes(idx) === false) {
            retryIndices.push(idx);
            productIdsLength += 1;
          }
          continue;
        }
      }

      if (quantity < 5 || price === null) {
        updates[idx] = new Product((template = updateQuery.template));
        continue;
      }

      const product = new Product(
        (template = updateQuery.template),
        (availability = "in stock"),
        quantity,
        price
      );
      product.markupPrice();
      updates[idx] = product;
      await timer(200 * (1 + Math.random()));
    }

    if (custom.includes["retries"] === true) {
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

function selectHtmlElements(merchant, content) {
  const $ = load(content || "");
  let quantity;
  let price;
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
    throw Error(error);
  }
}

module.exports = fetchProducts;
