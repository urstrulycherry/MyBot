import puppeteer from "puppeteer";
import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";

const process = async (message: WAWebJS.Message) => {
    console.log("Image Search");
    const error = "Sorry, I couldn't find any images for that search.";
    try {
        const search = message.body.slice(8).split(" ").join("+");
        if (!(search.split("+").length > 0)) return;
        trigger(message, search);
    } catch (_) {
        send.text(message, error);
    }
};

const trigger = async (message: WAWebJS.Message, search: string) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://duckduckgo.com/?va=j&t=hb&q=${search}&iax=images&ia=images`);
    const selector = "#zci-images > div > div.tile-wrap > div > div:nth-child(3) > div.tile--img__media > span > img";
    await page.waitForSelector(selector);
    const src = await page.$eval(selector, (img) => img.getAttribute("src"));
    if (!src) return;
    browser.close();
    send.url(message, `https://${src.slice(2)}`);
};

module.exports = {
    name: "search",
    process
};
