const lowPriceMarkup = 1.9;
const highPriceMarkup = 1.7;

class Product {



  constructor(availability, quantity, price) {
    this.availability = availability || "out of stock";
    this.quantity = quantity || "0";
    this.price = price;
    this.markup = 0.5;
  }

  markupPrice() {
    try {
      let intPrice = parseFloat(this.price.slice(1));

      let higherPrice =
        intPrice < 20
          ? Math.max(10, (intPrice *= lowPriceMarkup))
          : intPrice * highPriceMarkup;

      this.markup = Math.trunc(higherPrice * 100) / 100;
    } catch {
      return undefined;
    }
  }
}

module.exports = Product