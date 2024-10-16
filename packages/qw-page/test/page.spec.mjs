import puppeteer from 'puppeteer';
import { Dom } from '@qualweb/dom';

describe('QualWeb page', function () {
  let browser, incognito, page;

  before(async () => {
    browser = await puppeteer.launch({ headless: 'new' });
    incognito = await browser.createIncognitoBrowserContext();
    page = await incognito.newPage();
  });

  after(async () => {
    await page.close();
    await incognito.close();
    await browser.close();
  });

  it('Testing qw-page injection on browser', async function () {
    this.timeout(0);

    const dom = new Dom(page);
    await dom.process({ execute: {} }, 'https://www.aalborg.dk', '');

    await page.addScriptTag({
      path: './dist/qw-page.bundle.js',
      type: 'text/javascript'
    });

    await page.evaluate(() => {
      window.qwPage = new QWPage(document, window, true);
      const buttons = window.qwPage.getElements("button")
      console.log(buttons);
      for (let button of buttons) {
        console.log({ button, text: button.getElementText() });
      }
    });
  });
});
