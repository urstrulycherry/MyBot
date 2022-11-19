import puppeteer from "puppeteer";
import WAWebJS, { MessageMedia } from "whatsapp-web.js";
import { helper } from "../util/helper";
import { send } from "../util/reply";

const error = "Sorry, I couldn't find any images for that search.";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("Image Search");
    try {
        const msg = await helper.getMsgFromBody(message);
        if (!msg) return send.catch(message);
        trigger(message, options, msg);
    } catch (_) {
        send.text(message, options, error);
    }
};

const trigger = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, search: string) => {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto(`https://www.google.com/search?q=${search}&tbm=isch&safe=active`);
        const selector = "#islrg > div.islrc > div:nth-child(2) > a.wXeWr.islib.nfEiy";
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        const imgSelector = "#Sva75c > div > div > div > div.pxAole > div.tvh9oe.BIB1wf > c-wiz > div.nIWXKc.JgfpDb.cZEg1e > div.OUZ5W > div.zjoqD > div.qdnLaf.isv-id.b0vFpe > div > a > img";
        await page.waitForSelector(imgSelector);
        await new Promise(r => setTimeout(r, 5000));
        const src = await page.$eval(imgSelector, (img) => img.getAttribute("src"));
        if (!src) return send.catch(message);
        await browser.close();
        if (src.startsWith("data")) {
            const media = new MessageMedia("image/jpeg", src.split(",")[1], "image.jpeg");
            send.media(message, options, media);
        } else if (src.startsWith("http")) {
            send.url(message, options, src);
        } else {
            send.catch(message, error);
        }
    } catch (_) {
        send.catch(message, error);
    } finally {
        await browser.close();
    }
};

module.exports = {
    name: "search",
    process
};
