import WAWebJS, { MessageMedia } from "whatsapp-web.js";
import { send } from "../util/reply";

const invalidUrl = "Invalid url";
const noMedia = "No media found";

const process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
    console.log("link 2 media");
    let url = message.body.split(" ")[1];
    if (!url) {
        if (message.hasQuotedMsg) {
            let chat = await message.getChat();
            await chat.fetchMessages({ limit: 500 });
            let quotedMsg = await message.getQuotedMessage();
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
}

const trigger = (url: string, message: WAWebJS.Message) => {
    MessageMedia.fromUrl(url).then((media: MessageMedia) => {
        message.reply(media).catch((err: any) => { })
    }).catch((err: any) => {
        send.text(message, noMedia);
    })
}
const isValidURL = (s: string) => {
    try {
        let url = new URL(s);
        return true;
        // if (url.hostname.includes("fbcdn.net")) { return true; }
        // return false
    } catch (err) {
        return false;
    }
};

module.exports = {
    name: "l2m",
    process
}