"use strict";
exports.__esModule = true;
// CHEERIO SELECTORS
// Get Quantity
var quantitySelector1 = "select#quantity";
var quantitySelector2 = "select#rcxsubsQuan";
//   Get Price
var priceSelector = "div#corePrice_feature_div span.a-offscreen";
// SCRAPING ANT
var productUrl =
  "https://api.scrapingant.com/v1/general?browser=false&proxy_country=US&url=https://www.amazon.com/dp/";
var config = {
  headers: {
    "x-api-key": process.env.SCRAPING_ANT_X_API_KEY,
    useQueryString: true,
  },
};
// AMAZON FETCH HELPERS
var timer = function (ms) {
  return new Promise(function (res) {
    return setTimeout(res, ms);
  });
};

module.exports = {
  productUrl,
  config: config,
  timer: timer,
  quantitySelector1: quantitySelector1,
  quantitySelector2: quantitySelector2,
  priceSelector: priceSelector,
};
