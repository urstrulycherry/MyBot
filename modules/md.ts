import WAWebJS from "whatsapp-web.js";
import { tmd } from "./socialMedia/tmd";
import { imd } from "./socialMedia/imd";
import { send } from "../util/reply";

const invalidUrl = "Invalid url";
const noUrlFound = "No Urls found";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("Media Download");
    let links: string[] = [];
    if (message.body.split(/\s+/g).length > 1) {
        links = getLinksFromString(message.body);
    } else if (message.hasQuotedMsg) {
        const chat = await message.getChat();
        await chat.fetchMessages({ limit: 500 });
        const quotedMsg = await message.getQuotedMessage();
        links = getLinksFromString(quotedMsg.body);
    } else {
        send.text(message, invalidUrl);
        return;
    }

    if (links.length === 0) {
        send.text(message, noUrlFound);
        return;
    }
    links.forEach(link => {
        const url = new URL(link);
        if (url.hostname === "twitter.com") {
            tmd(message, link);
        } else if (url.hostname === "www.instagram.com") {
            imd(message, link);
        }
    });
};

const getLinksFromString = (str: string) => {
    const links: string[] = [];
    const words: string[] = str.split(/\s+/g);
    for (let i = 0; i < words.length; i++) {
        if (isValidHttpUrl(words[i])) {
            links.push(words[i]);
        }
    }
    return links;
};

const isValidHttpUrl = (u: string) => {
    let url: URL;
    try {
        url = new URL(u);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
};

module.exports = {
    name: "md",
    process
};
