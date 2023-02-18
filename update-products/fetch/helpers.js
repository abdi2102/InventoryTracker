// CHEERIO SELECTORS
// Get Quantity
const amazonQuantitySelector1 = "select#quantity";
const amazonQuantitySelector2 = "select#rcxsubsQuan";
//   Get Price
const amazonPriceSelector = "div#corePrice_feature_div span.a-offscreen";
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
const timer = function (ms) {
  return new Promise(function (res) {
    return setTimeout(res, ms);
  });
};

module.exports = {
  productUrl,
  config,
  timer,
  amazonQuantitySelector1,
  amazonQuantitySelector2,
  amazonPriceSelector,
};
