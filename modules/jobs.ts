import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";
import puppeteer from "puppeteer";
import { helper } from "../util/helper";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    const error = "Something went wrong, please try again later";
    try {
        console.log("Processing jobs");
        const msg = await helper.getMsgFromBody(message);
        if (!msg) return;
        const arr = msg.split("--").filter((item) => item.trim());
        const [keyword, location] = arr;

        if (!keyword || !location) {
            send.text(message, "Please provide keyword and location");
            return;
        }
        const text = await trigger(keyword, location);
        if (!text) {
            send.text(message, "No jobs found");
            return;
        }
        send.text(message, text);
    } catch (_) {
        send.text(message, error);
    }
};

const trigger = async (keyword: string, location: string) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://in.linkedin.com/jobs/search?keywords=${keyword}&location=${location}`);
    let jobs = await page.$$eval(".jobs-search__results-list li", (list) => {
        return list.map((li) => {
            try {
                return {
                    title: li.querySelector(".base-search-card__title")?.textContent?.trim().replace(/\n/g, ""),
                    company: li.querySelector(".base-search-card__subtitle")?.textContent?.trim().replace(/\n/g, ""),
                    location: li.querySelector(".job-search-card__location")?.textContent?.trim().replace(/\n/g, ""),
                    date: li.querySelector("time")?.innerText?.trim().replace(/\n/g, ""),
                    link: li.querySelector(".base-card__full-link")?.getAttribute("href")
                };
            } catch (e: unknown) {
                console.log(e);
            }
        });
    });
    browser.close();
    jobs = jobs.slice(0, 10);
    const text = jobs.map((job) => {
        return `✉️ ${job?.title}
🏬 ${job?.company}
📍 ${job?.location}
📅 ${job?.date}
🔗 ${job?.link}
`;
    }).join("\n\n");
    return text;
};

module.exports = {
    name: "jobs",
    process
};
