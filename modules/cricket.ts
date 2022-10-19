import puppeteer from "puppeteer";
import WAWebJS from "whatsapp-web.js";
import { helper } from "../util/helper";
import { send } from "../util/reply";

const process = async (message: WAWebJS.Message) => {
    console.log("live Cricket!!");
    const msg = await helper.getMsgFromBody(message);
    if (!msg) return;
    const browser = await puppeteer.launch();
    try {
        const query = `live cricket score ${msg}`;
        const page = await browser.newPage();
        await page.goto(`https://www.google.com/search?&q=${query}#sie=m;/g/11sm_fm6_5;5;/m/026y268;sm;fp;1;;;`);
        const selector = "#liveresults-sports-immersive__match-fullpage > div > div:nth-child(2) > div.nGzje";
        await page.waitForSelector(selector, { timeout: 5000 });
        const element = await page.$(selector);
        const filePath = `media/images/${message.id._serialized}.jpg`;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await element?.screenshot({ path: filePath });
        send.path(message, filePath);
        await browser.close();
    } catch (_) {
        send.text(message, "No Live Match Found!!");
    } finally {
        await browser.close();
    }
};

module.exports = {
    name: "cricket",
    process
};
