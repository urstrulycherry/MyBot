import puppeteer from "puppeteer";
import WAWebJS from "whatsapp-web.js";
import { helper } from "../util/helper";
import { send } from "../util/reply";

const process = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions) => {
    console.log("live Cricket!!");
    const msg = await helper.getMsgFromBody(message);
    if (!msg) return send.catch(message, "Enter at least one team name");
    const browser = await puppeteer.launch();
    try {
        const query = `live cricket score ${msg}`;
        const page = await browser.newPage();
        await page.goto(`https://www.google.com/search?&q=${query}`);
        let selector = ".imso-hov.imso-mh.PZPZlf";
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        selector = "div[jsname='RcgsAb']";
        await page.waitForSelector(selector, { timeout: 5000 });
        const element = await page.$(selector);
        const filePath = `media/images/${message.id._serialized}.jpg`;
        await element?.screenshot({ path: filePath });
        send.path(message, options, filePath);
        await browser.close();
    } catch (_) {
        send.catch(message, "No Live Match Found!!");
    } finally {
        await browser.close();
    }
};

module.exports = {
    name: "cric",
    process
};
