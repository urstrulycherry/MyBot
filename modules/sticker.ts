import WAWebJS, { Message } from "whatsapp-web.js";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
import fs from "fs";
import { send } from "../util/reply";
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
export const process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
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
        send.text(message, noMediaMessage);
        return;
    }
    trigger(message, mediaMessage, client);
};

const trigger = async (message: WAWebJS.Message, mediaMessage: WAWebJS.Message, client: WAWebJS.Client) => {
    mediaMessage.downloadMedia().then((media: WAWebJS.MessageMedia) => {
        if (!(media.mimetype === "image/jpeg" || media.mimetype === "video/mp4")) {
            send.text(message, incorrectMedia);
            return;
        }
        Util.formatToWebpSticker(media, metaData, client.pupPage).then((stickerMedia: WAWebJS.MessageMedia) => {
            const filename = `./media/stickers/${message.id._serialized}.webp`;
            const buff = Buffer.from(stickerMedia.data, "base64");
            fs.writeFileSync(filename, buff);
            send.sticker(message, filename);
        });
    });
};

module.exports = {
    name: "sticker",
    process
};
