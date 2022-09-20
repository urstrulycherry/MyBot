import { Message, MessageMedia } from "whatsapp-web.js";
import fs from "fs";

export class send {
    static text = async (message: Message, text: string) => {
        message.reply(text).catch((e) => {
            send.error(message, e);
        });
    };

    static sticker = async (message: Message, stickerPath: string) => {
        message.reply(MessageMedia.fromFilePath(stickerPath), undefined, { sendMediaAsSticker: true }).then(() => {
            if (stickerPath) {
                clearMedia(stickerPath);
            }
        }).catch((e) => {
            send.error(message, e);
        });
    };

    static media = async (message: Message, mediaPath: string) => {
        message.reply(MessageMedia.fromFilePath(mediaPath)).then(() => {
            clearMedia(mediaPath);
        }).catch((e) => {
            send.error(message, e);
        });
    };

    static mediaUrl = async (message: Message, mediaUrl: string) => {
        MessageMedia.fromUrl(mediaUrl, { unsafeMime: true }).then((media: MessageMedia) => {
            message.reply(media).catch((e) => {
                send.error(message, e);
            });
        }).catch((e) => {
            send.error(message, e);
        });
    };

    static error = async (message: Message, error: Error) => {
        message.reply(`*From:* ${message.from}\n*To:* ${message.to}\n\n*Error:* ${error}`, "120363027235324221@g.us")
            .catch(() => {
                console.log("error");
            });
    };

    static mediaMessage = async (message: Message, media: MessageMedia) => {
        message.reply(media).catch((e) => {
            send.error(message, e);
        });
    };
}


const clearMedia = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};
