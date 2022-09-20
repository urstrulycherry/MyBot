import WAWebJS, { MessageMedia } from "whatsapp-web.js";
import { send } from "../util/reply";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isAnimated = require("is-animated");

const noSticker = "Reply to a sticker to convert it to a image/video";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("sticker2media");
    if (!message.hasQuotedMsg) {
        send.text(message, noSticker);
        return;
    }
    const chat = await message.getChat();
    await chat.fetchMessages({ limit: 500 });
    const quotedMsg = await message.getQuotedMessage();

    if (!quotedMsg.hasMedia) {
        send.text(message, noSticker);
        return;
    }

    quotedMsg.downloadMedia().then((media: MessageMedia) => {
        const buff = Buffer.from(media.data, "base64");
        if (!(media.mimetype === "image/jpeg" || media.mimetype === "video/mp4")) return;
        if (!isAnimated(buff)) {
            send.mediaMessage(message, media);
        }
    });
};

module.exports = {
    name: "s2m",
    process
};
