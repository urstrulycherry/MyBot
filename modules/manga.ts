import WAWebJS from "whatsapp-web.js";
import puppeteer from "puppeteer";
import { Send } from "../util/reply";
import Jimp from "jimp";
import fs from "fs";
import { Helper } from "../util/helper";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    const paths: string[] = [];
    console.log("manga search!");
    const browser = await puppeteer.launch();
    try {
        const msg = await Helper.getMsgFromBody(message);
        if (!msg) return Send.catch(message);
        if (msg.length < 1) {
            return Send.catch(message, "Please enter manga name and chapter!");
        }
        const page = await browser.newPage();
        await page.goto(`https://gogomanga.fun/${msg.split(Helper.spliter).join("-")}`);
        let images = await page.$$eval("img", (imgs) => imgs.map((img) => img.src));
        await browser.close();
        images = images.slice(1, images.length - 8);
        if (images.length === 0) {
            return Send.catch(message, "Invalid chapter or manga name found!!");
        }
        fs.mkdirSync(`./media/temp/${msg}`, { recursive: true });
        const dir = `./media/temp/${msg}`;
        for (let i = 0; i < images.length; i++) {
            const filePath = `${dir}/${msg}-page${i}.jpg`;
            paths.push(filePath);
            const image = await Jimp.read(images[i]);
            await image.writeAsync(filePath);
        }
        await Send.pdf(message, options, paths, msg);
        fs.rmSync(dir, { recursive: true, force: true });
    } catch (_) {
        Send.catch(message, "Something went wrong, please try again later");
    } finally {
        await browser.close();
    }
};

module.exports = {
    name: "manga",
    process
};
