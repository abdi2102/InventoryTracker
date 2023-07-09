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

async function fetchProducts(productIds, properties, allowRetries) {
  // merchant pick
  let merchantUrl = "https://www.amazon.com/dp/";
  let merchant = "amazon";

  // validate
  const productIdsValid = validateProductIds(productIds);
  if (productIdsValid === false) {
    throw { msg: "product id(s) not valid", code: 400 };
  }

  let updates = [];

  try {
    const cookies = await fetchMerchantCookies(merchantUrl, config);

    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i][0];
      const content = await fetchMerchantProduct(
        merchantUrl,
        productId,
        config,
        cookies
      );

      let productInfo = scrapeMerchantProduct(content, merchant, properties);
      const inStock =
        productInfo.quantity < 5 ||
        (productInfo.quantity < 10 && productInfo.availability != "In Stock") ||
        productInfo.price == null;

      if (inStock === false && allowRetries === true) {
        console.log("i", i, productInfo, "retrying");
        const content = await fetchMerchantProduct(
          merchantUrl,
          productId,
          config,
          cookies
        );

        await timer(Math.random());

        productInfo = scrapeMerchantProduct(content, merchant, properties);
      }

      let product = new Product();

      if (inStock === true) {
        Object.keys(productInfo).forEach(
          (key) => (product[key] = productInfo[key])
        );
        product.markupPrice();
      }

      updates[i] = product;

      await timer(150 * (1 + Math.random()));
    }

    return updates;
  } catch (error) {
    console.log(error);
    if (updates.length > 0) {
      return updates;
    } else {
      throw {
        msg: "could not fetch products. try again later.",
        code: 500,
      };
    }
  }
}

function scrapeMerchantProduct(content, merchant, properties) {
  const $ = load(content || "");
  let product = {};
  switch (merchant) {
    case "amazon":
      const amazonSelectors = {
        price: $("div#corePrice_feature_div span.a-offscreen").html(),
        availability:
          $("div#availability span").html() === null
            ? ""
            : $("div#availability span").html().trim(),
        quantity:
          $("select#quantity").length != 0
            ? $("select#quantity").children().length
            : $("select#rcxsubsQuan").children().length,
      };

      properties.forEach((prop) => (product[prop] = amazonSelectors[prop]));
      product.availability = amazonSelectors.availability;
      break;
    default:
      throw { msg: "merchant not recognized", code: 400 };
  }

  return product;
}

async function fetchMerchantProduct(merchantUrl, productId, config, cookies) {
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
      if (status === 423 || status === 403) {
        // requests after are doomed to fail with these statuses
        throw {
          msg: "Unable to continue updates. Check back later.",
          code: status,
        };
      }

      return undefined;
    } else {
      throw error;
    }
  }
}

async function fetchMerchantCookies(merchantUrl, config) {
  // cookies to avoid scrape detection
  try {
    const {
      data: { cookies },
    } = await axios.get(`${scrapingAntUrl}${merchantUrl}`, config);
    return encodeURIComponent(cookies);
  } catch (error) {
    throw Error(error);
  }
}

function validateProductIds(productIds) {
  // validate productIds
  const productIdsValid = productIds.every((id) => {
    return Array.isArray(id) === false || id[0] == undefined ? false : true;
  });

  return productIdsValid;
}

module.exports = fetchProducts;
