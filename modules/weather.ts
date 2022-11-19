import WAWebJS from "whatsapp-web.js";
import puppeteer from "puppeteer";
import { helper } from "../util/helper";
import { send } from "../util/reply";

const error = "No weather data found";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("Weather");
    const msg = await helper.getMsgFromBody(message);
    if (!msg) return send.catch(message);
    trigger(msg, options, message);
};

const trigger = async (msg: string, options: WAWebJS.MessageSendOptions, message: WAWebJS.Message) => {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto(`https://www.google.com/search?q=${msg} weather`);
        await page.waitForSelector("#wob_wc", { timeout: 5000 });
        try {
            const selector = "#wob_wc > div.UQt4rd > div.Ab33Nc > div > div.vk_bk.wob-unit > a:nth-child(4) > span";
            const text = await page.$eval(selector, (el) => el.textContent);
            if (text?.includes("C")) {
                await page.click(selector);
            }
        } catch (_) {
            // ignore
        }
        const element = await page.$("#wob_wc");
        if (!element) return send.catch(message, error);
        const filePath = `./media/temp/weather_${new Date().getTime()}.png`;
        await element.screenshot({ path: filePath });
        await browser.close();
        send.path(message, options, filePath);
    } catch (_) {
        send.catch(message, error);
    } finally {
        await browser.close();
    }
};

module.exports = {
    name: "weather",
    process
};
