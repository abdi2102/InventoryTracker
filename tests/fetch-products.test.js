describe("a list of valid productIds should return amz. quantity, price for each Id", () => {
  test("array of invalid productIds should return array of unavailable products", () => {
    // expect [new Product()]
  });

  test("fetched product with quantity < 5 or price=null should return unavailable product ", () => {
    //   expect new Product()
  });

  test("fetched product with quantity >= 5 or price !== null should return        available product ", () => {
    // expect new Product(availability="in stock", quantity, price)
  });

  test("unsuccessful request would throw error and return updates in queue", () => {
    // expect [[new Product(availability="in stock", quantity, price)]]
  });
});
