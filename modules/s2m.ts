import WAWebJS, { MessageMedia } from "whatsapp-web.js";
import { send } from "../util/reply";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const isAnimated = require("is-animated");

const noSticker = "Reply to a sticker to convert it to a image/video";
const noMedia = "No media found";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("sticker2media");
    if (!message.hasQuotedMsg) {
        return send.catch(message, noSticker);
    }
    const chat = await message.getChat();
    await chat.fetchMessages({ limit: 500 });
    const quotedMsg = await message.getQuotedMessage();

    if (!quotedMsg.hasMedia) {
        return send.catch(message, noSticker);
    }

    quotedMsg.downloadMedia().then((media: MessageMedia) => {
        const buff = Buffer.from(media.data, "base64");
        console.log(media.mimetype);
        if (!(media.mimetype === "image/webp")) return send.catch(message);
        if (!isAnimated(buff)) {
            send.media(message, options, media);
        }
    }).catch(() => {
        return send.catch(message, noMedia);
    });
};

module.exports = {
    name: "s2m",
    process
};
