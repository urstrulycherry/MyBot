import WAWebJS from "whatsapp-web.js";
import { Send } from "../util/reply";
import { newPage } from "../util/puppeteerManager";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("quote");
    trigger(message, options);
};

const trigger = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions) => {
    const quotePath = "#mf-qotd > div > div:nth-child(2) > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(1) > td";
    const authorPath = "#mf-qotd > div > div:nth-child(2) > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(2) > td > a";

    const error = "Something went wrong, please try again later";
    try {
        const page = await newPage();
        await page.goto("https://en.wikiquote.org/wiki/Main_Page");
        await page.waitForSelector(quotePath);
        const [element1] = await page.$$(quotePath);
        const quoteText = await page.evaluate(ele => ele.textContent, element1);
        const [element2] = await page.$$(authorPath);
        const authorName = await page.evaluate(ele => ele.textContent, element2);
        const emoji1 = "😊❤️️";
        const emoji2 = "☕😋";
        const result = ` ${emoji1} *${new Date().toDateString()}* ${emoji1}\n${quoteText?.trim()}\n_${authorName?.trim()}_\n${emoji2}_Have a Good Day!_${emoji2}`;
        await page.close();
        Send.formattedText(message, options, result);
    } catch (_) {
        Send.catch(message, error);
    }
};

module.exports = {
    name: "quote",
    process
};
