import WAWebJS from "whatsapp-web.js";
import puppeteer from "puppeteer";
import { send } from "../../util/reply";

export const yt = async (message: WAWebJS.Message, url: string) => {
    console.log("Youtube download");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://en.savefrom.net/1-youtube-video-downloader-360/");
    await page.waitForSelector("#sf_url");
    await page.type("#sf_url", url);
    await page.click("#sf_submit");
    let selector = "#sf_result > div > div.result-box.video > div.info-box > div.link-box > div.def-btn-box > a";
    await page.waitForSelector(selector);
    const yourHref = await page.$eval(selector, anchor => anchor.getAttribute("href"));
    if (!yourHref) return;
    await page.goto("https://www.shorturl.at");
    selector = "#formurl > input[type = text]";
    await page.waitForSelector(selector);
    await page.type(selector, yourHref);
    await page.click("#formbutton > input[type=submit]");
    selector = "#shortenurl";
    await page.waitForSelector(selector);
    const link = await page.$eval(selector, anchor => anchor.getAttribute("value"));
    browser.close();
    send.text(message, `https://${link}`);
};
