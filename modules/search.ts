import puppeteer from "puppeteer";
import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";
import Jimp from "jimp";

const process = async (message: WAWebJS.Message) => {
    console.log("Image Search");
    const search = message.body.slice(8).split(" ").join("+");
    console.log(search);
    if (!(search.split("+").length > 0)) return;
    trigger(message, search);
};

const trigger = async (message: WAWebJS.Message, search: string) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://duckduckgo.com/?va=j&t=hb&q=${search}&iax=images&ia=images`);
    await page.waitForSelector("#zci-images > div > div.tile-wrap > div > div:nth-child(3) > div.tile--img__media > span > img");
    const src = await page.$eval("#zci-images > div > div.tile-wrap > div > div:nth-child(3) > div.tile--img__media > span > img", (img) => img.getAttribute("src"));
    if (!src) return;
    browser.close();
    const filePath = `media/temp/${search.replace("+", " ")}.jpeg`;
    const image = await Jimp.read(`https://${src.slice(2)}`);
    await image.writeAsync(filePath);
    send.path(message, filePath);
};

module.exports = {
    name: "search",
    process
};
