const { lowPriceMarkup, highPriceMarkup } = require("./appHelpers");

class Product {
  constructor(availability, quantity, price) {
    this.availability = availability || "out of stock";
    this.quantity = quantity || 0;
    this.price = price || 0.5;
  }

  markup() {
    try {
      let intPrice = parseFloat(this.price.slice(1));

      let markup =
        intPrice < 20
          ? Math.max(10, (intPrice *= lowPriceMarkup))
          : intPrice * highPriceMarkup;

      this.price = Math.trunc(markup * 100) / 100;
    } catch {
      return undefined;
    }
  }
}
module.exports = Product;
