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
  const { merchant } = updateQuery;
  // merchant pick
  let merchantUrl;
  switch (merchant) {
    case "amazon":
      merchantUrl = "https://www.amazon.com/dp/";
      break;
    default:
      throw { msg: "merchant not recognized", code: 400 };
  }

  // validate
  const productIdsValid = validateProductIds(productIds);
  if (productIdsValid === false) {
    throw { msg: "Product Id(s) Not Valid", code: 400 };
  }

  // fetch
  const {
    custom: { retries },
    template,
  } = updateQuery;
  let updates = [];

  try {
    const cookies = await fetchMerchantCookies(
      merchantUrl,
      productIds.length,
      config
    );

    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i][0];
      const content = await fetchMerchantProduct(
        merchantUrl,
        productId,
        config,
        cookies
      );

      let productInfo = scrapeMerchantProduct(merchant, content);

      if (productInfo.productIsInStock === false && retries === true) {
        console.log("i", i, productInfo, "retrying");
        const content = await fetchMerchantProduct(
          merchantUrl,
          productId,
          config,
          cookies
        );

        await timer(1 + Math.random());

        productInfo = scrapeMerchantProduct(merchant, content);
      }

      const { quantity, price } = productInfo;

      if (productInfo.productIsInStock === false) {
        updates[i] = new Product(template);
      } else {
        const product = new Product(
          template,
          (availability = "in stock"),
          quantity,
          price
        );
        product.markupPrice();
        updates[i] = product;
      }

      await timer(150 * (1 + Math.random()));
    }

    return updates;
  } catch (error) {
    console.log(error);
    if (updates.length > 0) {
      return updates;
    } else {
      throw Error({
        msg: "could not fetch products. try again later.",
        code: 500,
      });
    }
  }
}

function scrapeMerchantProduct(merchant, content) {
  const $ = load(content || "");
  let quantity;
  let price;
  let productIsInStock;
  switch (merchant) {
    case "amazon":
      const amazonQuantity1 = $("select#quantity");
      const amazonQuantity2 = $("select#rcxsubsQuan");
      const amazonPrice = $(
        "div#corePrice_feature_div span.a-offscreen"
      ).html();
      const amazonAvailability =
        $("div#availability span").html() === null
          ? ""
          : $("div#availability span").html().trim();

      quantity =
        amazonQuantity1.length != 0
          ? amazonQuantity1.children().length
          : amazonQuantity2.children().length;

      price = amazonPrice;

      productIsInStock =
        quantity < 5 || amazonAvailability != "In Stock" || price == null
          ? false
          : true;

      console.log(price, quantity, productIsInStock);
      break;
    default:
      throw Error("merchant not recognized");
  }
  return { productIsInStock, quantity, price };
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
    console.log(error);
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

async function fetchMerchantCookies(merchantUrl, productCount, config) {
  // cookies to avoid scrape detection

  if (productCount < 10) {
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

function validateProductIds(productIds) {
  // validate productIds
  const productIdsValid = productIds.every((id) => {
    return Array.isArray(id) === false || id[0] == undefined ? false : true;
  });

  return productIdsValid;
}

module.exports = fetchProducts;
