import WAWebJS from "whatsapp-web.js";
import puppeteer from "puppeteer";
import { Send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("quote");
    trigger(message, options);
};

const trigger = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions) => {
    const quotePath = '//*[@id="mf-qotd"]/div/div[2]/table/tbody/tr[1]/td/table/tbody/tr/td[3]/table/tbody/tr[1]/td';
    const authorPath = '//*[@id="mf-qotd"]/div/div[2]/table/tbody/tr[1]/td/table/tbody/tr/td[3]/table/tbody/tr[2]/td';

    const error = "Something went wrong, please try again later";
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto("https://en.wikiquote.org/wiki/Main_Page");
        await page.waitForXPath(quotePath);
        const [element1] = await page.$x(quotePath);
        const quoteText = await page.evaluate(ele => ele.textContent, element1);
        const [element2] = await page.$x(authorPath);
        const authorName = await page.evaluate(ele => ele.textContent, element2);
        const emoji1 = "😊❤️️🌞";
        const emoji2 = "☀️☕➡️️😋";
        const result = `*${new Date().toDateString()}* ${emoji1}\n${quoteText?.trim()}\n_${authorName?.substring(1, authorName.length - 2).trim()}_\n_Have a Good Day!_ ${emoji2}`;
        browser.close();
        Send.text(message, options, result);
    } catch (_) {
        Send.catch(message, error);
    } finally {
        await browser.close();
    }
};

module.exports = {
    name: "quote",
    process
};
