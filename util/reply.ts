import { Message, MessageMedia } from "whatsapp-web.js";
import fs from "fs";
import pdfkit from "pdfkit";

export class send {
    static fileLimit = 15.5;
    static text = async (message: Message, text: string) => {
        const formatter = "```";
        if (text.startsWith(formatter) && text.endsWith(formatter)) {
            text = text.substring(formatter.length, text.length - formatter.length);
        }
        const reply = await message.reply(`${formatter}${text}${formatter}`)
            .catch((e) => {
                react.error(message);
                send.error(message, e);
            });
        if (!reply) return;
        react.success(message);
        return reply;
    };

    static sticker = async (message: Message, stickerMedia: MessageMedia) => {
        const filename = `./media/stickers/${message.id._serialized}.webp`;
        const buff = Buffer.from(stickerMedia.data, "base64");
        fs.writeFileSync(filename, buff);
        const reply = await message.reply(MessageMedia.fromFilePath(filename), undefined, { sendMediaAsSticker: true })
            .catch((e) => {
                react.error(message);
                send.error(message, e);
            })
            .finally(() => {
                clearMedia(filename);
            });
        if (!reply) return;
        react.success(message);
        return reply;
    };

    static path = async (message: Message, mediaPath: string) => {
        return send.media(message, MessageMedia.fromFilePath(mediaPath))
            .finally(() => {
                clearMedia(mediaPath);
            });
    };

    static url = async (message: Message, mediaUrl: string) => {
        return MessageMedia.fromUrl(mediaUrl, { unsafeMime: true })
            .then((media: MessageMedia) => {
                return send.media(message, media);
            }).catch((e) => {
                send.error(message, e);
            });
    };

    static error = async (message: Message, error: Error) => {
        const to = message.fromMe ? message.from : message.to;
        react.error(message);
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
            const reply = await message.reply(media)
                .catch((e) => {
                    react.error(message);
                    send.error(message, e);
                });
            if (!reply) return;
            react.success(message);
            return reply;
        }
    };

    static document = async (message: Message, media: MessageMedia) => {
        const reply = await message.reply(media, undefined, { sendMediaAsDocument: true })
            .catch((e) => {
                react.error(message);
                send.error(message, e);
            });
        if (!reply) return;
        react.success(message);
        return reply;
    };

    static pdf = async (message: Message, files: string[], fileName?: string) => {
        const doc = new pdfkit();
        for (let i = 0; i < files.length; i++) {
            doc.image(files[i], 0, 0, { fit: [630, 750], align: "center", valign: "center" });
            if (i < files.length - 1) {
                doc.addPage();
            }
            clearMedia(files[i]);
        }
        doc.end();
        const path = `./media/temp/${fileName || message.id._serialized}.pdf`;
        doc.pipe(fs.createWriteStream(path)).on("finish", () => {
            return this.path(message, path);
        }).on("error", (e: Error) => {
            this.error(message, e);
        });
    };

    static catch = async (message: Message, text: string) => {
        react.warning(message);
        return message.reply(`_${text}_`);
    };
}

export class react {
    static proccessing = async (message: Message) => {
        return message.react("🔄").catch(() => {
            return;
        });
    };

    static success = async (message: Message) => {
        return message.react("✅").catch(() => {
            return;
        });
    };

    static error = async (message: Message) => {
        return message.react("❌").catch(() => {
            return;
        });
    };

    static warning = async (message: Message) => {
        return message.react("⚠️").catch(() => {
            return;
        });
    };
}

const clearMedia = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};
