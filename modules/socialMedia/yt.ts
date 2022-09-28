import WAWebJS from "whatsapp-web.js";
import puppeteer from "puppeteer";
import { send } from "../../util/reply";

export const yt = async (message: WAWebJS.Message, url: string) => {
    console.log("Youtube download");
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://en.savefrom.net/1-youtube-video-downloader-360/");
    await page.waitForSelector("#sf_url");
    await page.type("#sf_url", url);
    await page.click("#sf_submit");
    await page.waitForSelector("#sf_result > div > div.result-box.video > div.info-box > div.link-box > div.def-btn-box > a");
    const yourHref = await page.$eval("#sf_result > div > div.result-box.video > div.info-box > div.link-box > div.def-btn-box > a", anchor => anchor.getAttribute("href"));
    if (!yourHref) return;
    await page.goto("https://www.shorturl.at");
    await page.waitForSelector("#formurl > input[type=text]");
    await page.type("#formurl > input[type=text]", yourHref);
    await page.click("#formbutton > input[type=submit]");
    await page.waitForSelector("#shortenurl");
    const link = await page.$eval("#shortenurl", anchor => anchor.getAttribute("value"));
    browser.close();
    send.text(message, `https://${link}`);
};
