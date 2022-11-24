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
    "x-api-key": process.env.SCRAPING_ANT_X_API_KEY,
    useQueryString: true,
  },
};

// AMAZON FETCH HELPERS
const timer = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = {
  productUrl,
  config,
  timer,
  quantitySelector1,
  quantitySelector2,
  priceSelector,
};
