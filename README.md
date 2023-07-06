# InventoryTracker
Reads product ASIN from Google sheet, fetches Amazon data, updates Google sheet using FB shop template with new product info.
Important!
- grant read/write access to Google sheet if it is not owned by user executing code
- A credentials.json file needs to be in the project root. Get credential access by going to console.google.cloud.com and requesting spreadsheet scope.
- .env in project root to store express SESSION_SECRET, SCRAPING_ANT_X_API_KEY

COMPLETED:
  - progress bar for updates
  - Google auth scheme
  - rough-in for greater merchant, google sheet template support

TODO:
  - check permissions of Google sheet before reading/writing
  - improve client-side ui
  - add testing for backend/frontend
  - improve merchant, google sheet template support
  - add support for new product additions directly from the merchant
    


I am moving on from this project. It does have a lot of potential, and I am passing along the torch to others who would like to improve it.

