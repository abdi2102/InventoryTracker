class Sheet {
  constructor(link, sheetName, template) {
    this.link = link;
    this.sheetName = sheetName;
    this.template = template;
  }

  getId() {
    try {
      return this.link.match("/d/([a-zA-Z0-9-_]+)")[1];
    } catch (error) {
      throw { msg: "link not valid", code: 400 };
    }
  }
}

module.exports = Sheet;
