const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeYelpReviews(input) {
  try {
        // Check if input is a business name or a Yelp URL
    let url;
    if (input.startsWith('https://www.yelp.com/')) {
      url = input;
    } else {
      url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(input)}`;
    }

    const reviewerNames = [];

    async function scrape(pageNumber) {
      const updatedUrl = url + pageNumber;
    // Fetch the Yelp page HTML
      const response = await axios.get(updatedUrl);
      const html = response.data;
    // Parse HTML with Cheerio
      const $ = cheerio.load(html);
  // Extract review information
      $('.margin-b5__09f24__pTvws.border-color--default__09f24__NPAKY').each((index, element) => {
      

        const parentDiv = $(element);

        const nameElement = parentDiv.find('span.fs-block.css-ux5mu6[data-font-weight="bold"]');
        const locationElement = parentDiv.find('span.css-qgunke');
        const ratingElement = parentDiv.find('span.display--inline__09f24__c6N_k.border-color--default__09f24__NPAKY');
        const textElement = parentDiv.find('span.raw__09f24__T4Ezm');

        const location = locationElement.text();
        const name = nameElement.text();
        const rating = ratingElement.find('div').first().attr('aria-label');
        const text = textElement.text();

        if (name === '' || name === "Username") {
          return;
        }

        reviewerNames.push({ name: name, location: location, rating: rating, text: text});
      });
    }

 //gets number of reviews
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const targetElement = $('a.css-19v1rkv');
    const str = targetElement.text();

    const pattern = /^\(([\d,]+)\sreviews\)/;  
    const match = str.match(pattern);

    let number;

    if (match && match[1]) {
      const numberString = match[1].replace(/,/g, '');  // Remove commas from the number string
      number = parseInt(numberString, 10);
    }

    const promises = [];
    //runs function scrape for each page of reviews
    for (let x = 0; x < number+10; x += 10) {




      const pageNum = x === 0 ? '' : `&start=${x}`;
      promises.push( scrape(pageNum));
     
    }

 
    await Promise.all(promises);

    return reviewerNames;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

module.exports = scrapeYelpReviews;
