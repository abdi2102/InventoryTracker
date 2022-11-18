const axios = require("axios");
const cheerio = require("cheerio");
const { mainAmazonUrl, productUrl, config } = require("./appHelpers");
const {
  quantitySelector1,
  quantitySelector2,
  priceSelector,
  timer,
  unavailableProduct,
  lowPriceMarkup,
  highPriceMarkup,
} = require("./appHelpers");

async function fetchProducts(productIds) {
  let updates = [];

  try {
    const cookies = await fetchMerchantCookies(
      mainAmazonUrl,
      config,
      productIds.length
    );

    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];

      if (isvalidProductId(productId) === false) {
        updates.push(unavailableProduct);
      } else {
        const {
          data: { content },
        } = await axios.get(
          `${productUrl}${productId[0].trim()}&cookies=${cookies}`,
          config
        );

        let { quantity, price } = selectHtmlElements(content);

        if (quantity < 5 || price == null) {
          updates.push(unavailableProduct);
        } else {
          price = markup(price);

          updates.push({
            availability: "in stock",
            quantity,
            price,
          });
        }

        await timer(520 * (1 + Math.random()));
      }
    }
    return updates;
  } catch (error) {
    if (updates.length > 0) {
      return updates;
    } else {
      throw Error(error);
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

async function fetchMerchantCookies(mainAmazonUrl, config, productCount) {
  // cookies to avoid scrape detection

  try {
    if (productCount < 5) {
      return "";
    }

    const {
      data: { cookies },
    } = await axios.get(mainAmazonUrl, config);

    return encodeURIComponent(cookies);
  } catch (error) {
    throw Error(error);
  }
}

function markup(price) {
  try {
    let intPrice = parseFloat(price.slice(1));

    let markup =
      intPrice < 20
        ? Math.max(10, (intPrice *= lowPriceMarkup))
        : intPrice * highPriceMarkup;

    return Math.trunc(markup * 100) / 100;
  } catch {
    return undefined;
  }
}

module.exports = fetchProducts;
