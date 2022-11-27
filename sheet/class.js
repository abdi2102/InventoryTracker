class Sheet {

  constructor(link, sheetName) {
    this.link = link;
    this.sheetName = sheetName;
    this.id;
  }

  getId() {
    this.id = this.link.match("/d/([a-zA-Z0-9-_]+)")[1];
  }
}

module.exports = Sheet

