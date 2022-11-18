class Product {
  constructor(availability, quantity, price) {
    this.availability = availability || "out of stock";
    this.quantity = quantity || 0;
    this.price = price || 0.5;
    
  }
}
module.exports = Product;
