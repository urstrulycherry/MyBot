import WAWebJS from "whatsapp-web.js";
import { Helper } from "../util/helper";
import { Send } from "../util/reply";
import { newPage } from "../util/puppeteerManager";


const process = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions) => {
    console.log("live Cricket!!");
    const msg = await Helper.getMsgFromBody(message);
    if (!msg) return Send.catch(message, "Enter at least one team name");
    await trigger(msg, message, options);
};

const trigger = async (msg: string, message: WAWebJS.Message, options: WAWebJS.MessageSendOptions) => {
    const jsControllerSelector = ".imso-hov.imso-mh.PZPZlf";
    const outputJSSelector = "div[jsname='RcgsAb']";
    try {
        const query = `live cricket score ${msg}`;
        const page = await newPage();
        await page.goto(`https://www.google.com/search?&q=${query}`);
        await page.waitForSelector(jsControllerSelector, { timeout: 5000 });
        await page.click(jsControllerSelector);
        await page.waitForSelector(outputJSSelector, { timeout: 5000 });
        const element = await page.$(outputJSSelector);
        const filePath = `media/images/${message.id._serialized}.jpg`;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await element?.screenshot({ path: filePath });
        Send.path(message, options, filePath);
        await page.close();
    } catch (_) {
        Send.catch(message, "No Live Match Found!!");
    }
};
module.exports = {
    name: "cric",
    process
};
