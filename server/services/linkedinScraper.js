const axios = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
};

async function scrapeLinkedInJob(url) {
  // Normalize URL to guest-accessible format
  const normalized = url
    .replace(/\/jobs\/view\/(\d+).*/, '/jobs/view/$1')
    .split('?')[0];

  const response = await axios.get(normalized, {
    headers: HEADERS,
    timeout: 10000,
    maxRedirects: 3,
  });

  const $ = cheerio.load(response.data);

  // Extract job title
  const title =
    $('h1.top-card-layout__title').text().trim() ||
    $('h1.job-details-jobs-unified-top-card__job-title').text().trim() ||
    $('h1[class*="title"]').first().text().trim();

  // Extract company name
  const company =
    $('a.topcard__org-name-link').text().trim() ||
    $('[class*="company-name"]').first().text().trim() ||
    $('a[class*="org-name"]').first().text().trim();

  // Extract job description
  const description =
    $('.show-more-less-html__markup').text().trim() ||
    $('[class*="job-description"]').text().trim() ||
    $('[class*="description__text"]').text().trim();

  if (!description) {
    throw new Error(
      'Could not extract job description from this LinkedIn URL. LinkedIn may require login for this listing — please paste the job description manually.'
    );
  }

  return { title, company, description };
}

module.exports = { scrapeLinkedInJob };
