import WAWebJS from "whatsapp-web.js";
import { Send } from "../../util/reply";
import * as dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

const noMedia = "No media found";
const invalid = "Invalid url/Something went wrong";

export const tmd = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, url: string) => {
    try {
        const username = new URL(url).pathname.split("/")[1];
        const tweetId = new URL(url).pathname.split("/")[3];
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector("img", { visible: true });
        const imageNodes = await page.$x(`//a[contains(@href, "/${username}/status/${tweetId}/photo/")]`);
        const imageUrls = await Promise.all(
            imageNodes.map(async (node) => {
                const imgTag = await node.$("img");
                const imageUrl = await imgTag?.evaluate((img) => img.getAttribute("src"));
                return `${imageUrl?.split("?")[0]}?format=jpg&name=4096x4096`;
            })
        );
        await browser.close();
        if (imageUrls.length > 0) {
            imageUrls.forEach((imageUrl) => {
                Send.url(message, options, imageUrl);
            });
        } else {
            Send.catch(message, noMedia);
        }
    } catch (error) {
        Send.catch(message, invalid);
    }
};
