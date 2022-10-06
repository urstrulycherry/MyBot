import WAWebJS from "whatsapp-web.js";
import puppeteer from "puppeteer";
import { send } from "../util/reply";
import Jimp from "jimp";

const process = async (message: WAWebJS.Message) => {
    const paths: string[] = [];
    console.log("manga search!");
    const browser = await puppeteer.launch();
    const msg = message.body.split(/\s+/g).slice(1).join("-");
    if (msg.length < 1) {
        return send.text(message, "Please enter manga name and chapter!");
    }
    const page = await browser.newPage();
    await page.goto(`https://gogomanga.fun/${msg}`);
    let images = await page.$$eval("img", (imgs) => imgs.map((img) => img.src));
    browser.close();
    images = images.slice(1, images.length - 8);
    if (images.length === 0) {
        return send.text(message, "Invalid chapter or manga name found!!");
    }
    for (let i = 0; i < images.length; i++) {
        paths.push(`media/temp/${msg}-page${i}.jpg`);
        const image = await Jimp.read(images[i]);
        await image.writeAsync(`media/temp/${msg}-page${i}.jpg`);
    }
    send.pdf(message, paths);
};

module.exports = {
    name: "manga",
    process
};
