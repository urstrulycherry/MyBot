import puppeteer, { Browser, Page } from "puppeteer";

let browser: Browser | null = null;

async function initializeBrowser() {
    browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox"
        ]
    });
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
