import WAWebJS from "whatsapp-web.js";
import { tmd } from "./socialMedia/tmd";
import { imd } from "./socialMedia/imd";
import { helper, send } from "../util/reply";
import { yt } from "./socialMedia/yt";

const invalidUrl = "Invalid url";
const noUrlFound = "No Urls found";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("Media Download");
    let links: string[] = [];
    if (message.body.split(/\s+/g).length > 1) {
        links = helper.getLinksFromString(message.body);
    } else if (message.hasQuotedMsg) {
        const chat = await message.getChat();
        await chat.fetchMessages({ limit: 500 });
        const quotedMsg = await message.getQuotedMessage();
        links = helper.getLinksFromString(quotedMsg.body);
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
        } else if (url.hostname === "www.youtube.com" || url.hostname === "youtu.be" || url.hostname === "youtube.com" || url.hostname === "m.youtube.com") {
            yt(message, link);
        } else {
            send.url(message, link);
        }
    });
};

module.exports = {
    name: "md",
    process
};
