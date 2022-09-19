import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";
import puppeteer from "puppeteer";
import Jimp from "jimp";

const arts = ["Paint", "HDR", "Polygon", "Gouache", "Realistic", "Comic", "Line-Art", "Malevolent", "Meme", "Vibrant", "HD", "Blacklight", "Dark Fantasy"];
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("Image");
    let body = message.body;
    body = body.replace(/^[^\s]+\s/, "");
    // eslint-disable-next-line prefer-const
    let [prompt, art] = body.split(" -");
    if (!art) art = "Realistic";
    if (!arts.includes(art)) art = "Realistic";
    if (!prompt || !art) return;
    trigger(prompt, art, message).catch(() => {
        send.text(message, "Something went wrong");
    });
};

const trigger = async (prompt: string, art: string, message: WAWebJS.Message) => {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto("https://app.wombo.art");
    await page.type(".TextInput__Input-sc-1qnfwgf-1", prompt);
    page.click(`img[alt='${art}']`);
    await page.waitForSelector(".iMLenh");
    page.click(".iMLenh");
    // await page.waitForSelector("#blur-overlay > div > div > div > div.PaneContainers__PaneDisplayContainer-sc-9ic5sr-1.jTkaiO > div > img");
    await page.waitForXPath("/html/body/div[1]/div/div[3]/div/div/div/div[3]/div[2]/div[1]/button");
    const src = await page.$eval("#blur-overlay > div > div > div > div.PaneContainers__PaneDisplayContainer-sc-9ic5sr-1.jTkaiO > div > img", (e) => e.getAttribute("src"));
    browser.close();
    if (!src) return;
    const image = await Jimp.read(src);
    await image.crop(76, 226, 930, 1551).writeAsync(`${message.id._serialized}.jpg`);
    send.media(message, `${message.id._serialized}.jpg`);
};

module.exports = {
    name: "img",
    process
};
