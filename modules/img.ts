import WAWebJS from "whatsapp-web.js";
import { Send } from "../util/reply";
import { Helper } from "../util/helper";
import { newPage } from "../util/puppeteerManager";

const arts: { [key: string]: string; } = {
    Arcane: "	https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/arcane.jpeg",
    Realistic: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/realistic_v2.jpg",
    Expressionism: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/expressionism.png",
    Figure: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/figure.jpeg",
    HDR: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/hdr.png",
    Spectral: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/spectralv2.jpg",
    Comic: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/comic.png",
    SoftTouch: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/softtouch.png",
    BuliojourneyV2: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/buliojourney_v2.jpg",
    HD: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/hd.jpg",
    Anime: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/anime.png",
    Ink: "https://d3j730xi5ph1dq.cloudfront.net/dream/style_thumbnail/ink.png"
};

const error = "Something went wrong, please try again later";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    try {
        console.log("Image");
        const msg = await Helper.getMsgFromBody(message);
        if (!msg) return Send.catch(message);
        // eslint-disable-next-line prefer-const
        let [prompt, art] = msg.split(" -");
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
    const inputSelector = ".TextInput__Input-sc-1qnfwgf-1";
    const buttonSelector = ".iMLenh";
    const closeButtonSelector = ".FkQre";
    const outputSelector = ".gbeYse";
    try {
        const page = await newPage();
        await page.goto("https://dream.ai/create");
        // wait for 3 seconds
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await page.type(inputSelector, prompt);
        if (art !== "BuliojourneyV2") await page.click(`img[src='${arts[art]}']`);
        await page.waitForSelector(buttonSelector);
        await page.click(buttonSelector);
        await page.waitForSelector(closeButtonSelector);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await page.click(closeButtonSelector);
        await page.waitForSelector(outputSelector);
        const src = await page.$eval(outputSelector, (e) => e.getAttribute("src"));
        await page.close();
        if (!src) return Send.catch(message, error);
        await Send.url(message, options, src);
    } catch (_) {
        Send.catch(message, error);
    }
};

module.exports = {
    name: "img",
    process
};
