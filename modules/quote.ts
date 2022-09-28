import WAWebJS from "whatsapp-web.js";
import puppeteer from "puppeteer";

const Xpath = '//*[@id="mf-qotd"]/div/div[2]/table/tbody/tr[1]/td/table/tbody/tr/td[3]/table/tbody/tr[1]/td';

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("quote");
    trigger(message);
};

const trigger = async (message:WAWebJS.Message) => {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();
    await page.goto("https://en.wikiquote.org/wiki/Main_Page");
    await page.waitForXPath(Xpath);
    const [element] = await page.$x(Xpath);
    const text = await page.evaluate(ele => ele.textContent, element);
    const result = `*${new Date().toDateString()}*\n${text?.trim()}\n_Have a Good Day!_`;
    browser.close();
    message.reply(result);
};

module.exports = {
    name: "quote",
    process
};
