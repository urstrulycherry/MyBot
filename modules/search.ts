import puppeteer from "puppeteer";
import WAWebJS, { MessageMedia } from "whatsapp-web.js";
import { send } from "../util/reply";

const error = "Sorry, I couldn't find any images for that search.";
const process = async (message: WAWebJS.Message) => {
    console.log("Image Search");
    try {
        const search = message.body.split(/\s+/g).slice(1).join("+");
        if (!search) return;
        trigger(message, search);
    } catch (_) {
        send.text(message, error);
    }
};

const trigger = async (message: WAWebJS.Message, search: string) => {
    try {
        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        await page.goto(`https://www.google.co.in/search?q=${search}&tbm=isch`);
        const selector = "#islrg > div.islrc > div:nth-child(2) > a.wXeWr.islib.nfEiy";
        await page.waitForSelector(selector);
        await page.click(selector);
        const imgSelector = "#Sva75c > div > div > div.pxAole > div.tvh9oe.BIB1wf > c-wiz > div > div.OUZ5W > div.zjoqD > div.qdnLaf.isv-id.b0vFpe > div > a > img";
        await page.waitForSelector(imgSelector);
        await new Promise(r => setTimeout(r, 2500));
        const src = await page.$eval(imgSelector, (img) => img.getAttribute("src"));
        if (!src) return;
        browser.close();
        if (src.startsWith("data")) {
            const media = new MessageMedia("image/jpeg", src.split(",")[1], "image.jpeg");
            send.media(message, media);
        } else if (src.startsWith("http")) {
            send.url(message, src);
        } else {
            send.text(message, error);
        }
    } catch (_) {
        send.text(message, error);
    }
};

module.exports = {
    name: "search",
    process
};
