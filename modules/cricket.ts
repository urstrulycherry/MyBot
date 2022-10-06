import puppeteer from "puppeteer";
import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";

const process = async (message: WAWebJS.Message) => {
    console.log("live Cricket!!");
    try {
        const browser = await puppeteer.launch();
        const msg = `live+cricket+score+${message.body.split(/\s+/g).slice(1).join("+")}`;
        const page = await browser.newPage();
        await page.goto(`https://www.google.com/search?&q=${msg}`);
        let selector = "#sports-app > div > div.imso-hov.imso-mh.PZPZlf > div:nth-child(2) > div > div > div > div.imso_mh__tm-scr.imso_mh__mh-bd.imso-hov";
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        selector = "#liveresults-sports-immersive__match-fullpage > div > div:nth-child(2) > div.nGzje > div.imso-hide-loading.imso-mh.PZPZlf > div:nth-child(2) > div > div > div > div.imso_mh__tm-scr.imso_mh__mh-bd";
        await page.waitForSelector(selector, { timeout: 5000 });
        const element = await page.$(selector);
        const filePath = `media/images/${message.id._serialized}.jpg`;
        await element?.screenshot({ path: filePath });
        send.path(message, filePath);
        browser.close();
    } catch (e: unknown) {
        send.text(message, "No Live Match Found!!");
    }
};

module.exports = {
    name: "cricket",
    process
};