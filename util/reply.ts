import { Message, MessageMedia } from "whatsapp-web.js";
import fs from 'fs';

export class send {
    static sticker = async (message: Message, stickerPath: string, mediaPath: string | undefined) => {
        message.reply(MessageMedia.fromFilePath(stickerPath), undefined, { sendMediaAsSticker: true }).then(() => {
            if (mediaPath) {
                clearMedia(mediaPath);
            }
            if (stickerPath) {
                clearMedia(stickerPath);
            }
        });
    }

    static text = async (message: Message, text: string) => {
        message.reply(text).catch(() => { return })
    }

    static media = async (message: Message, mediaPath: string) => {
        message.reply(MessageMedia.fromFilePath(mediaPath)).then(() => {
            clearMedia(mediaPath);
        }).catch(() => { return })
    }

    static mediaUrl = async (message: Message, mediaUrl: string) => {
        MessageMedia.fromUrl(mediaUrl).then((media: MessageMedia) => {
            message.reply(media).then(() => {
                console.log('media sent--', media.filename);

            }).catch(() => { return })
        }).catch(() => { return })
    }

    static error = async (message: Message) => {
        message.reply("Something went wrong").catch(() => { return })
    }
}


const clearMedia = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
