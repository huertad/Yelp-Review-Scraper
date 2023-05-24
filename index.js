const scrapeYelpReviews = require('./Scraper');

scrapeYelpReviews('Yelp-Business-Main-Page-Url-Here')
  .then((reviews) => {
    console.log(reviews);
   
   
  })
  .catch((error) => {
    console.error(error);
  });
