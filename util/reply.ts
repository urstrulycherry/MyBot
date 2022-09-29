import { Message, MessageMedia } from "whatsapp-web.js";
import fs from "fs";

export class send {
    static fileLimit = 15.5;
    static text = async (message: Message, text: string) => {
        const formatter = "```";
        if (text.startsWith(formatter) && text.endsWith(formatter)) {
            text = text.substring(formatter.length, text.length - formatter.length);
        }
        return message.reply(`${formatter}${text}${formatter}`)
            .catch((e) => {
                send.error(message, e);
            });
    };

    static sticker = async (message: Message, stickerMedia: MessageMedia) => {
        const filename = `./media/stickers/${message.id._serialized}.webp`;
        const buff = Buffer.from(stickerMedia.data, "base64");
        fs.writeFileSync(filename, buff);
        return message.reply(MessageMedia.fromFilePath(filename), undefined, { sendMediaAsSticker: true })
            .catch((e) => {
                send.error(message, e);
            })
            .finally(() => {
                clearMedia(filename);
            });
    };

    static path = async (message: Message, mediaPath: string) => {
        send.media(message, MessageMedia.fromFilePath(mediaPath))
            .finally(() => {
                clearMedia(mediaPath);
            });
    };

    static url = async (message: Message, mediaUrl: string) => {
        MessageMedia.fromUrl(mediaUrl, { unsafeMime: true })
            .then((media: MessageMedia) => {
                send.media(message, media);
            }).catch((e) => {
                send.error(message, e);
            });
    };

    static error = async (message: Message, error: Error) => {
        const to = message.fromMe ? message.from : message.to;
        return message.reply(`*From:* ${message.from}\n*To:* ${message.to}\n\n*Error:* ${error}`, to)
            .catch(() => {
                console.log("Error sending error message");
            });
    };

    static media = async (message: Message, media: MessageMedia) => {
        const mediaSize = media.data.length * 3 / 4 / 1024 / 1024;
        if (mediaSize > send.fileLimit) {
            send.document(message, media);
        } else {
            return message.reply(media)
                .catch((e) => {
                    send.error(message, e);
                });
        }
    };

    static document = async (message: Message, media: MessageMedia) => {
        return message.reply(media, undefined, { sendMediaAsDocument: true }).catch((e) => {
            send.error(message, e);
        });
    };
}

const clearMedia = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};
