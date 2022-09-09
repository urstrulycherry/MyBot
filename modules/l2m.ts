import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";

const invalidUrl = "Invalid url";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("link 2 media");
    let url = message.body.split(" ")[1];
    if (!url) {
        if (message.hasQuotedMsg) {
            const chat = await message.getChat();
            await chat.fetchMessages({ limit: 500 });
            const quotedMsg = await message.getQuotedMessage();
            url = quotedMsg.body;
        }
    }
    if (!url) {
        send.text(message, invalidUrl);
        return;
    }
    if (!isValidURL(url)) {
        send.text(message, invalidUrl);
        return;
    }
    trigger(url, message);
};

const trigger = (url: string, message: WAWebJS.Message) => {
    send.mediaUrl(message, url);
};
const isValidURL = (s: string) => {
    try {
        const url = new URL(s);
        if (url !== null) {
            return true;
        } return false;
    } catch (err) {
        return false;
    }
};

module.exports = {
    name: "l2m",
    process
};
