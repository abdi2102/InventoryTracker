class Spreadsheet {
  constructor(link) {
    this.link = link;
    this.id;
  }

  getId() {
    this.id = this.link.match("/d/([a-zA-Z0-9-_]+)")[1];
  }

  checkGoogleSheetsAccess(auth) {
  // return array of permissions e.g. ["read", "write"]
}

}

module.exports = Spreadsheet;
