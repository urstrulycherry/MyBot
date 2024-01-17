import WAWebJS from "whatsapp-web.js";
import { Send } from "../util/reply";
import { Helper } from "../util/helper";
import { newPage } from "../util/puppeteerManager";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    const error = "Something went wrong, please try again later";
    try {
        console.log("Processing jobs");
        const msg = await Helper.getMsgFromBody(message);
        if (!msg) return Send.catch(message);
        const arr = msg.split("-").filter((item) => item.trim());
        const [keyword, location] = arr;

        if (!keyword || !location) {
            return Send.catch(message, "Please provide keyword and location");
        }
        const text = await trigger(keyword, location);
        if (!text) {
            return Send.catch(message, "No jobs found");
        }
        Send.text(message, options, text);
    } catch (_) {
        Send.catch(message, error);
    }
};

const trigger = async (keyword: string, location: string) => {
    const resultListSelector = ".jobs-search__results-list li";
    try {
        const page = await newPage();
        await page.goto(`https://in.linkedin.com/jobs/search?keywords=${keyword}&location=${location}`);
        let jobs = await page.$$eval(resultListSelector, (list) => {
            return list.map((li) => {
                try {
                    const titleSelector = ".base-search-card__title";
                    const companySelector = ".base-search-card__subtitle";
                    const locationSelector = ".job-search-card__location";
                    const dateSelector = "time";
                    const linkSelector = ".base-card__full-link";
                    return {
                        title: li.querySelector(titleSelector)?.textContent?.trim().replace(/\n/g, ""),
                        company: li.querySelector(companySelector)?.textContent?.trim().replace(/\n/g, ""),
                        location: li.querySelector(locationSelector)?.textContent?.trim().replace(/\n/g, ""),
                        date: li.querySelector(dateSelector)?.innerText?.trim().replace(/\n/g, ""),
                        link: li.querySelector(linkSelector)?.getAttribute("href")
                    };
                } catch (e: unknown) {
                    console.log(e);
                }
            });
        });
        await page.close();
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
    }
};

module.exports = {
    name: "jobs",
    process
};
