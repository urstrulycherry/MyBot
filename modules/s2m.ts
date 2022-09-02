import WAWebJS, { MessageMedia } from "whatsapp-web.js";
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
import fs from 'fs';
import { join } from "path";
import { send } from "../util/reply";
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const isAnimated = require('is-animated')


let noSticker = "Reply to a sticker to convert it to a image/video";
let process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
    console.log("sticker2media");
    if (!message.hasQuotedMsg) {
        send.text(message, noSticker);
        return
    }
    let chat = await message.getChat();
    await chat.fetchMessages({ limit: 500 });
    let quotedMsg = await message.getQuotedMessage();

    if (!quotedMsg.hasMedia) {
        send.text(message, noSticker);
        return
    }

    quotedMsg.downloadMedia().then((media: MessageMedia) => {
        let buff = Buffer.from(media.data, "base64")
        if (isAnimated(buff)) {
        } else {
            send.mediaMessage(message, media);
        }
    }).catch(() => {
        send.text(message, "catch-" + noSticker);
    })
}

module.exports = {
    name: "s2m",
    process
}