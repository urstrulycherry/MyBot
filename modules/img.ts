import WAWebJS from "whatsapp-web.js";
import { Send } from "../util/reply";
import puppeteer from "puppeteer";
import { Helper } from "../util/helper";

const arts: { [key: string]: string; } = {
    Arcane: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/arcane.jpeg",
    Realistic: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/realistic.jpeg",
    Expressionism: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/expressionism.png",
    Figure: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/figure.jpeg",
    HDR: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/hdr.png",
    Spectral: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/spectral.jpeg",
    Comic: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/comic.png",
    SoftTouch: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/softtouch.png",
    Meme: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/meme.jpg"
};

const error = "Something went wrong, please try again later";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    try {
        console.log("Image");
        const msg = await Helper.getMsgFromBody(message);
        if (!msg) return Send.catch(message);
        // eslint-disable-next-line prefer-const
        let [prompt, art] = msg.split(" --");
        if (!art) art = "Realistic";
        if (!Object.keys(arts).includes(art)) art = "Realistic";
        if (!prompt || !art) return Send.catch(message);
        trigger(prompt, art, message, options).catch(() => {
            Send.catch(message, "Something went wrong");
        });
    } catch (_) {
        Send.catch(message, error);
    }
};

const trigger = async (prompt: string, art: string, message: WAWebJS.Message, options: WAWebJS.MessageSendOptions) => {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto("https://app.wombo.art");
        await page.type(".TextInput__Input-sc-1qnfwgf-1", prompt);
        await page.click(`img[src='${arts[art]}']`);
        await page.waitForSelector(".iMLenh");
        await page.click(".iMLenh");
        await page.waitForSelector(".gbeYse");
        const src = await page.$eval("#blur-overlay > div > div > div > div.PaneContainers__PaneDisplayContainer-sc-9ic5sr-1.DreamOutput__PaneDisplayContainer-sc-q3wcit-0.jTkaiO.VHHrf.MobileResults__DreamOutput-sc-s7ji7u-1.cbNGzl > div.DreamOutput__DreamOutputContainer-sc-q3wcit-3.kNyBTv > div > div > div:nth-child(1) > div > div > div > div.SelectableItem-sc-6c0djm-1.eYCbYI > img", (e) => e.getAttribute("src"));
        if (!src) return Send.catch(message, error);
        Send.url(message, options, src, prompt);
    } catch (_) {
        Send.catch(message, error);
    } finally {
        await browser.close();
    }
};

module.exports = {
    name: "img",
    process
};
