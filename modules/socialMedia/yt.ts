import WAWebJS from "whatsapp-web.js";
import puppeteer from "puppeteer";
import { send } from "../../util/reply";

export const yt = async (message: WAWebJS.Message, url: string) => {
    const error = "Something went wrong, please try again later";
    try {
        console.log("Youtube download");
        const browser = await puppeteer.launch({
            args: ["--no-sandbox"]
        });
        const page = await browser.newPage();
        await page.goto("https://en.savefrom.net/1-youtube-video-downloader-360/");
        await page.waitForSelector("#sf_url");
        await page.type("#sf_url", url);
        await page.click("#sf_submit");
        let selector = "#sf_result > div > div.result-box.video > div.info-box > div.link-box > div.def-btn-box > a";
        await page.waitForSelector(selector);
        const yourHref = await page.$eval(selector, anchor => anchor.getAttribute("href"));
        if (!yourHref) return;
        selector = "#sf_result > div > div.result-box.video > div.info-box > div.meta > div.row.duration";
        await page.waitForSelector(selector);
        const duration = await page.$eval(selector, div => div.textContent);
        if (!duration) return;
        const seconds = duration.split(":").reverse().reduce((prev, curr, i) => prev + parseInt(curr, 10,) * 60 ** i, 0);
        if (seconds < 70) {
            return send.url(message, yourHref);
        }
        page.goto("https://tinyurl.com/app/");
        selector = "#long-url";
        await page.waitForSelector(selector);
        await page.type(selector, yourHref);
        selector = "#tinyurl > div.root > div.d-flex.flex-column.overflow-y-a.h-100 > section > div > div > div:nth-child(1) > div > div.col-lg-8 > div > div.col-md-7 > div > div > div > div > form > div.d-flex.align-items-center.mt-3 > button.btn.btn-block.btn-t-green.btn-xl.d-md-none";
        await page.keyboard.press("Enter");
        selector = "#tinyurl > div.root > section > div > div.flex-grow-1.overflow-y-a.border-bottom > div.border-top > div > div > div > div > div.flex-fill > div.alias > div";
        await page.waitForSelector(selector);
        let link = await page.$eval(selector, div => div.textContent);
        link = `https://${link?.trim()}`;
        send.text(message, link);
        await browser.close();
    } catch (_) {
        send.text(message, error);
    }
};
