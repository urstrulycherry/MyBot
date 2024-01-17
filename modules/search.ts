import WAWebJS, { MessageMedia } from "whatsapp-web.js";
import { Helper } from "../util/helper";
import { Send } from "../util/reply";
import { newPage } from "../util/puppeteerManager";

const error = "Sorry, I couldn't find any images for that search.";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("Image Search");
    try {
        const msg = await Helper.getMsgFromBody(message);
        if (!msg) return Send.catch(message);
        trigger(message, options, msg);
    } catch (_) {
        Send.text(message, options, error);
    }
};

const trigger = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, search: string) => {
    const firstImgSelector = "#islrg > div.islrc > div:nth-child(2) > a.wXeWr.islib.nfEiy";
    const imgSelector = "#Sva75c > div.A8mJGd.NDuZHe > div.dFMRD > div.pxAole > div.tvh9oe.BIB1wf > c-wiz > div > div > div > div.n4hgof > div.MAtCL.PUxBg > a > img.r48jcc.pT0Scc.iPVvYb";

    try {
        const page = await newPage();
        await page.goto(`https://www.google.com/search?q=${search}&tbm=isch&safe=active`);
        await page.waitForSelector(firstImgSelector, { timeout: 5000 });
        await page.click(firstImgSelector);
        await page.waitForSelector(imgSelector);
        await new Promise(r => setTimeout(r, 3000));
        const src = await page.$eval(imgSelector, (img) => img.getAttribute("src"));
        if (!src) return Send.catch(message);
        await page.close();
        if (src.startsWith("data")) {
            const media = new MessageMedia("image/jpeg", src.split(",")[1], "image.jpeg");
            Send.media(message, options, media);
        } else if (src.startsWith("http")) {
            Send.url(message, options, src);
        } else {
            Send.catch(message, error);
        }
    } catch (_) {
        Send.catch(message, error);
    }
};

module.exports = {
    name: "search",
    process
};
