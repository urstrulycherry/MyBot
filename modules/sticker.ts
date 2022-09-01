import WAWebJS, { MessageMedia } from "whatsapp-web.js";
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
import fs from 'fs';
import { send } from "../util/reply";
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

let noMediaMessage = "No media found";
let incorrectMedia = "Incorrect media";
let process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
    console.log("sticker");
    if (message.hasMedia) {
        let filename = message.id._serialized
        let stickerPath = getFilePath(filename, mediaType.sticker)
        if (fs.existsSync(stickerPath)) {
            send.sticker(message, stickerPath, undefined).catch(() => { return })
        } else {
            message.downloadMedia().then((media: MessageMedia) => {
                trigger(message, media, filename).catch(() => { return })
            }).catch((err: any) => { console.log(err) });
        }
    } else if (message.hasQuotedMsg) {
        let chat = await message.getChat();
        await chat.fetchMessages({ limit: 500 });
        let quotedMsg = await message.getQuotedMessage();
        if (quotedMsg.hasMedia) {
            let filename = quotedMsg.id._serialized
            let stickerPath = getFilePath(filename, mediaType.sticker)
            if (fs.existsSync(stickerPath)) {
                send.sticker(message, stickerPath, undefined).catch(() => { return })
            } else {
                quotedMsg.downloadMedia().then((media: MessageMedia) => {
                    trigger(quotedMsg, media, filename).catch(() => { return })
                })
            }
        } else {
            send.text(message, noMediaMessage).catch(() => { return })
        }
    } else {
        send.text(message, noMediaMessage).catch(() => { return })
    }
}

enum mediaType {
    sticker = 1,
    image,
    video
}

const getFilePath = (fileName: string, ext: number) => {
    if (ext == 1) {
        return "./media/stickers/" + fileName + ".webp";
    } else if (ext == 2) {
        return "./media/images/" + fileName + ".jpeg";
    } else if (ext == 3) {
        return "./media/videos/" + fileName + ".mp4";
    }
    else {
        return "";
    }
}

const trigger = async (message: WAWebJS.Message, media: WAWebJS.MessageMedia, filename: string) => {
    if (!media) {
        send.text(message, noMediaMessage);
        return
    }
    if (media.mimetype == "image/jpeg") {
        let imagePath = getFilePath(filename, mediaType.image)
        let stickerPath = getFilePath(filename, mediaType.sticker)
        let buff = Buffer.from(media.data, 'base64');
        fs.writeFileSync(imagePath, buff)
        ffmpeg(imagePath)
            .outputOptions(["-y", "-vcodec libwebp"])
            .videoFilters("scale=2000:2000:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=2000:2000:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1")
            .save(stickerPath)
            .on("end", async (err: any) => {
                if (!err) {
                    send.sticker(message, stickerPath, imagePath).catch(() => { return })
                }
            })
    } else if (media.mimetype == "video/mp4") {
        let videoPath = getFilePath(filename, mediaType.video)
        let stickerPath = getFilePath(filename, mediaType.sticker)
        if (fs.existsSync(stickerPath)) {
            send.sticker(message, stickerPath, undefined);
        } else {
            let buff = Buffer.from(media.data, 'base64');
            fs.writeFileSync(videoPath, buff);
            ffmpeg(videoPath)
                .duration(8)
                .outputOptions(["-y", "-vcodec libwebp", "-lossless 1", "-qscale 1", "-preset default", "-loop 0", "-an", "-vsync 0", "-s 600x600",])
                .videoFilters("scale=600:600:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=600:600:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1")
                .save(stickerPath)
                .on("end", async (err: any) => {
                    if (!err) {
                        send.sticker(message, stickerPath, videoPath).catch(() => { return })
                    }
                })
        }
    } else {
        send.text(message, incorrectMedia).catch(() => { return })
    }
}

module.exports = {
    name: "sticker",
    process
}