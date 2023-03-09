class Sheet {
  constructor(link, sheetName, template) {
    this.link = link;
    this.sheetName = sheetName;
    this.template = template;
  }

  getId() {
    return this.link.match("/d/([a-zA-Z0-9-_]+)")[1];
  }
}

module.exports = Sheet;
