// CHEERIO SELECTORS

// Get Quantity
let quantitySelector1 = "select#quantity";
let quantitySelector2 = "select#rcxsubsQuan";

//   Get Price
let priceSelector = "div#corePrice_feature_div span.a-offscreen";

// SCRAPING ANT
const productUrl =
  "https://api.scrapingant.com/v1/general?browser=false&proxy_country=US&url=https://www.amazon.com/dp/";

const config = {
  headers: {
    "x-api-key": "aacf5794c3394314915f4932ef412cdd",
    useQueryString: true,
  },
};


// AMAZON FETCH HELPERS
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
const lowPriceMarkup = 1.9;
const highPriceMarkup = 1.7;

// google Api

const verifyGoogleAccessTokenUrl =
  "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=";

// form validation
const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = {
  productUrl,
  config,
  timer,
  lowPriceMarkup,
  highPriceMarkup,
  verifyGoogleAccessTokenUrl,
  quantitySelector1,
  quantitySelector2,
  priceSelector,
  isValidUrl,
};
