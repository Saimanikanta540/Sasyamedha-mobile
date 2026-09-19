import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport to mobile size
  await page.setViewport({ width: 390, height: 844 });
  
  const url = 'https://stitch.withgoogle.com/preview/5012185308925259622?node-id=a53f4c138d0943a8a5b623fa09e4b15e';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Wait a little extra for rendering
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'screenshot.png' });
  console.log('Screenshot saved as screenshot.png');
  
  await browser.close();
})();
