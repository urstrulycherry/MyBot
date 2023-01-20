import WAWebJS, { Message } from "whatsapp-web.js";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
import { Send } from "../util/reply";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Util = require("whatsapp-web.js/src/util/Util");
Util.setFfmpegPath(ffmpegPath);

const noMediaMessage = "No media found";
const incorrectMedia = "Incorrect media";
const metaData = {
    name: "bot",
    author: "MyBot",
    categories: []
};
export const process = async (message: WAWebJS.Message, client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("sticker");
    let mediaMessage: Message | undefined;
    if (message.hasMedia) {
        mediaMessage = message;
    } else if (message.hasQuotedMsg) {
        const chat = await message.getChat();
        await chat.fetchMessages({ limit: 500 });
        const quotedMsg = await message.getQuotedMessage();
        if (quotedMsg.hasMedia) {
            mediaMessage = quotedMsg;
        }
    }
    if (mediaMessage === undefined) {
        return Send.catch(message, noMediaMessage);
    }
    trigger(message, options, mediaMessage, client);
};

const trigger = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, mediaMessage: WAWebJS.Message, client: WAWebJS.Client) => {
    mediaMessage.downloadMedia().then((media: WAWebJS.MessageMedia) => {
        if (!(media.mimetype === "image/jpeg" || media.mimetype === "video/mp4")) {
            return Send.catch(message, incorrectMedia);
        }
        Util.formatToWebpSticker(media, metaData, client.pupPage).then((stickerMedia: WAWebJS.MessageMedia) => {
            Send.sticker(message, options, stickerMedia);
        });
    }).catch(() => {
        return Send.catch(message, noMediaMessage);
    });
};

module.exports = {
    name: "sticker",
    process
};
