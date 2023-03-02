const lowPriceMarkup = 1.9;
const highPriceMarkup = 1.7;

class Product {
  constructor(template, availability, quantity, price) {
    this.template = template;
    switch (template) {
      case "fbShops":
        this.availability = availability || "out of stock";
        this.quantity = quantity || "0";
        this.price = price;
        this.markup = 0.5;
        break;
      default:
        this.availability = availability;
        this.quantity = quantity;
        this.price = price;
        this.markup = 0;
    }
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

module.exports = Product;
