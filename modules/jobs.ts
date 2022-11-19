import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";
import puppeteer from "puppeteer";
import { helper } from "../util/helper";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    const error = "Something went wrong, please try again later";
    try {
        console.log("Processing jobs");
        const msg = await helper.getMsgFromBody(message);
        if (!msg) return send.catch(message);
        const arr = msg.split("--").filter((item) => item.trim());
        const [keyword, location] = arr;

        if (!keyword || !location) {
            return send.catch(message, "Please provide keyword and location");
        }
        const text = await trigger(keyword, location);
        if (!text) {
            return send.catch(message, "No jobs found");
        }
        send.text(message, options, text);
    } catch (_) {
        send.catch(message, error);
    }
};

const trigger = async (keyword: string, location: string) => {
    const browser = await puppeteer.launch();
    try {
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
        await browser.close();
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
    } catch (_) {
        return "";
    } finally {
        await browser.close();
    }
};

module.exports = {
    name: "jobs",
    process
};
