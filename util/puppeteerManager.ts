import puppeteer, { Browser, Page } from "puppeteer";
import { PUPPETEER_ARGS } from "../conf";

let browser: Browser | null = null;

async function initializeBrowser() {
    browser = await puppeteer.launch(PUPPETEER_ARGS);
}

export async function newPage(): Promise<Page> {
    if (!browser) {
        await initializeBrowser();
    }
    if (browser) {
        const page = await browser.newPage();
        return page;
    }
    throw new Error("Browser is not initialized");
}

export async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}
