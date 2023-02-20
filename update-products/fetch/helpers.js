// CHEERIO SELECTORS

// ----Amazon ---- // 
// Get Quantity
const amazonQuantitySelector1 = "select#quantity";
const amazonQuantitySelector2 = "select#rcxsubsQuan";
//   Get Price
const amazonPriceSelector = "div#corePrice_feature_div span.a-offscreen";
// SCRAPING ANT

// ----Amazon ---- // 


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
  config,
  timer,
  amazonQuantitySelector1,
  amazonQuantitySelector2,
  amazonPriceSelector,
};
