import WAWebJS from "whatsapp-web.js";
import puppeteer from "puppeteer";
import { send } from "../util/reply";
import Jimp from "jimp";
import fs from "fs";

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
    fs.mkdirSync(`./media/temp/${msg}`, { recursive: true });
    const dir = `./media/temp/${msg}`;
    for (let i = 0; i < images.length; i++) {
        const filePath = `${dir}/${msg}-page${i}.jpg`;
        paths.push(filePath);
        const image = await Jimp.read(images[i]);
        await image.writeAsync(filePath);
    }
    await send.pdf(message, paths, msg);
    fs.rmSync(dir, { recursive: true, force: true });
};

module.exports = {
    name: "manga",
    process
};
