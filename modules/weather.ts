import WAWebJS from "whatsapp-web.js";
import puppeteer from "puppeteer";
import { Helper } from "../util/helper";
import { Send } from "../util/reply";

const error = "No weather data found";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("Weather");
    const msg = await Helper.getMsgFromBody(message);
    if (!msg) return Send.catch(message);
    trigger(msg, options, message);
};

const trigger = async (msg: string, options: WAWebJS.MessageSendOptions, message: WAWebJS.Message) => {
    const weatherResultSelector = "#wob_wc";
    const metricSelector = "#wob_wc > div.UQt4rd > div.Ab33Nc > div > div.vk_bk.wob-unit > a:nth-child(4) > span";

    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto(`https://www.google.com/search?q=${msg} weather`);
        await page.waitForSelector(weatherResultSelector, { timeout: 5000 });
        try {
            const text = await page.$eval(metricSelector, (el) => el.textContent);
            if (text?.includes("C")) {
                await page.click(metricSelector);
            }
        } catch (_) {
            // ignore
        }
        const element = await page.$(weatherResultSelector);
        if (!element) return Send.catch(message, error);
        const filePath = `./media/temp/weather_${new Date().getTime()}.png`;
        await element.screenshot({ path: filePath });
        await browser.close();
        Send.path(message, options, filePath);
    } catch (_) {
        Send.catch(message, error);
    } finally {
        await browser.close();
    }
};

module.exports = {
    name: "weather",
    process
};
