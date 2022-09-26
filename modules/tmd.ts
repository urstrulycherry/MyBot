import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const twitterGetUrl = require("twitter-url-direct");

const invalidUrl = "Invalid url";
const noMedia = "No media found";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("tmd");
    let url = message.body.split(" ")[1];
    if (!isValidURL(url) && !message.hasQuotedMsg) {
        send.text(message, invalidUrl).catch(() => {
            return;
        });
        return;
    }
    if (!isValidURL(url)) {
        const chat = await message.getChat();
        await chat.fetchMessages({ limit: 500 });
        const quotedMsg = await message.getQuotedMessage();
        if (isValidURL(quotedMsg.body)) {
            url = quotedMsg.body;
        }
    }
    if (url) {
        trigger(getUrl(url), message);
    } else {
        send.text(message, invalidUrl).catch(() => {
            return;
        });
    }
};

const trigger = async (url: string, message: WAWebJS.Message) => {
    const response = await twitterGetUrl(url);
    if (response.found === true) {
        if (response.type === "video/gif") {
            const download: variants[] = response.download;
            let maxWidth = -1;
            let maxWidthIndex = -1;
            for (let i = 0; i < download.length; i++) {
                if (Number(download[i].width) >= maxWidth) {
                    maxWidth = Number(download[i].width);
                    maxWidthIndex = i;
                }
            }
            if (maxWidthIndex === -1) {
                send.text(message, noMedia);
                return;
            }
            const mediaUrl = download[maxWidthIndex].url;
            send.url(message, mediaUrl);
        } else if (response.type === "image") {
            const mediaUrl = response.download;
            send.url(message, mediaUrl);
        } else {
            send.text(message, noMedia);
        }
    } else {
        send.text(message, noMedia);
    }
};

type variants = {
    width: string,
    height: string,
    dimension: string,
    url: string
}

const getUrl = (url: string) => {
    return new URL(url).href;
};

const isValidURL = (s: string) => {
    try {
        const url = new URL(s);
        if (url.hostname === "twitter.com") {
            const path = url.pathname.split("/");
            if (path.length === 4 && path[2] === "status") {
                return true;
            }
        }
        return false;
    } catch (err) {
        return false;
    }
};

module.exports = {
    name: "tmd",
    process
};
