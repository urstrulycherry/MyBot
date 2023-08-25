import WAWebJS from "whatsapp-web.js";
import { Send } from "../util/reply";
import puppeteer from "puppeteer";
import { Helper } from "../util/helper";

const error = "Something went wrong, please try again later";
const invalid = "Please provide a valid text to translate";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("tr");
    const text = await Helper.getFormattedMsgFromBody(message);
    if (!text) {
        return Send.catch(message, invalid);
    }
    const [from, to] = getFromAndTo(text);
    const result = await translate(message, text, from, to);
    if (result) {
        Send.text(message, options, result);
    } else {
        Send.catch(message, error);
    }
};

const translate = async (message: WAWebJS.Message, text: string, from?: string, to?: string): Promise<string | undefined> => {
    text = text.replace(Helper.hypenRegex, "").trim();
    if (!text) return;
    if (!from) {
        from = "-auto";
    }
    if (!to) {
        to = "-en";
    }
    const url = `https://translate.google.com/?hl=en&sl=${from.substring(1)}&tl=${to.substring(1)}&text=${encodeURIComponent(text)}&op=translate`;
    let result = "";
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector(".ryNqvb");
        const elements = await page.$$(".ryNqvb");
        for (const element of elements) {
            const res = await page.evaluate(ele => ele.textContent, element);
            result += res;
        }
    } catch (err) {
        return;
    }
    return result;
};

const getFromAndTo = (text: string): (string | undefined)[] => {
    const matches = text.match(Helper.hypenRegex);

    if (matches && matches.length >= 2) {
        return matches.slice(-2);
    } else if (matches && matches.length === 1) {
        return [undefined, matches[0]];
    }

    return [];
};


module.exports = {
    name: "tr",
    process
};
