import WAWebJS from "whatsapp-web.js";
import puppeteer from "puppeteer";
import { Send } from "../../util/reply";
import ytdl from "ytdl-core";

export const yt = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, url: string) => {
    const error = "Something went wrong, please try again later";
    try {
        console.log("Youtube download");
        const info = await ytdl.getInfo(url);
        const duration = Number(info.videoDetails.lengthSeconds);
        const formats = ytdl.filterFormats(info.formats, "videoandaudio");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const video = formats.filter((f) => f.hasVideo).sort((a, b) => b.width! - a.width!)[0];
        const videoUrl = video.url;
        if (duration < 70) {
            return Send.url(message, options, videoUrl);
        }
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto("https://tinyurl.com/app/");
        let selector = "#long-url";
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.type(selector, videoUrl);
        selector = "#tinyurl > div.root > div.d-flex.flex-column.overflow-y-a.h-100 > section > div > div > div:nth-child(1) > div > div.col-lg-8 > div > div.col-md-7 > div > div > div > div > form > div.d-flex.align-items-center.mt-3 > button.btn.btn-block.btn-t-green.btn-xl.d-md-none";
        await page.keyboard.press("Enter");
        selector = "#tinyurl > div.root > section > div > div.flex-grow-1.overflow-y-a.border-bottom > div.border-top > div > div > div > div > div.flex-fill > div.alias > div";
        await page.waitForSelector(selector, { timeout: 5000 });
        let link = await page.$eval(selector, div => div.textContent);
        link = `https://${link?.trim()}`;
        await Send.text(message, options, link);
        await page.close();
        await browser.close();
    } catch (_) {
        Send.catch(message, error);
    }
};
