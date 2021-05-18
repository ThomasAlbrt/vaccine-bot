const puppeteer = require("puppeteer");
const notifier = require("node-notifier");

const takeScreenshot = async (page) => {
  await page.screenshot({
    path: "./screenshots/screenshot.png",
    fullPage: true,
  });
};

const closeCookiesBanner = async (page) => {
  const cookiesBanner = await page.$("#didomi-notice-agree-button");
  await cookiesBanner.click();
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

const checkArea = async (city, department) => {
  if (department === "91" || department === "27" || department === "60") {
    return false;
  }

  return true;
};

const checkSlots = async (page) => {
  const centers = await page.$$("div.dl-search-result");
  for (let center of centers) {
    const [department, city] = await getAddress(center);
    const area = await checkArea(city, department);
    if (!area) return false;

    const slots = await center.$$("div.availabilities-slots");
    for (let slot of slots) {
      const hour = await slot.$("div.Tappable-inactive");
      let availableSlot = await (hour && hour.evaluate((el) => el.textContent));

      if (availableSlot) {
        return center;
      }
    }
  }
};

const getAddress = async (center) => {
  const areaBlock = await center.$("div.dl-text > div");
  const addressBlock = await areaBlock.evaluate((el) => el.innerHTML);
  const postalCode = addressBlock.split("<br>")[1].split(" ")[1];
  const department = postalCode.slice(0, 2);
  const city = addressBlock.split("<br>")[1].split(" ")[2];

  return [department, city];
};

const getCenterUrl = async (center) => {
  const url = await center.$eval("a.dl-button-primary", (button) =>
    button.getAttribute("href")
  );
  return `https://www.doctolib.fr${url}`;
};

const sendNotif = async (centerUrl, potentialCenter, i) => {
  const [department, city] = await getAddress(potentialCenter);
  console.log(`Vaccine found at ${city} (${department})`);
  console.log(`Found on page ${i} of Doctolib's results`);

  notifier.notify({
    icon: __dirname + "images/icon.jpg",
    title: "There's a freaking créneau ma couille !",
    subtitle: `Go go dans à ${city} (${department}) !`,
    message: "Chope l'occasion !",
    open: centerUrl,
    sound: true,
  });
};

const scraper = async () => {
  console.log("Looking for a vaccine ...");
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  try {
    for (let i = 0; i < 10; i++) {
      const page = await browser.newPage();
      const url = `https://www.doctolib.fr/vaccination-covid-19/paris?ref_visit_motive_ids[]=6970&ref_visit_motive_ids[]=7005&force_max_limit=2&page=${i}`;
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 0,
      });

      if (i === 0) await closeCookiesBanner(page);

      await autoScroll(page);
      const potentialCenter = await checkSlots(page);
      if (!potentialCenter) {
        continue;
      }
      const centerUrl = await getCenterUrl(potentialCenter);
      await sendNotif(centerUrl, potentialCenter, i);
      console.log("--------------------------------------");
    }

    await browser.close();
  } catch (err) {
    console.log(err);
  }
};

scraper();
