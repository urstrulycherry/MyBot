import { Message, MessageMedia } from "whatsapp-web.js";
import fs from "fs";
import pdfkit from "pdfkit";

export class send {
    static fileLimit = 15.5;
    static text = async (message: Message, text: string, needReact = true) => {
        const formatter = "```";
        if (text.startsWith(formatter) && text.endsWith(formatter)) {
            text = text.substring(formatter.length, text.length - formatter.length);
        }
        return message.reply(`${formatter}${text}${formatter}`)
            .then((replyMsg: Message) => {
                if (needReact) {
                    react.success(message);
                }
                return replyMsg;
            })
            .catch((e) => {
                react.error(message);
                send.error(message, e);
            });
    };

    static sticker = async (message: Message, stickerMedia: MessageMedia) => {
        const filename = `./media/stickers/${message.id._serialized}.webp`;
        const buff = Buffer.from(stickerMedia.data, "base64");
        fs.writeFileSync(filename, buff);
        return message.reply(MessageMedia.fromFilePath(filename), undefined, { sendMediaAsSticker: true })
            .then((replyMsg: Message) => {
                react.success(message);
                return replyMsg;
            })
            .catch((e) => {
                react.error(message);
                send.error(message, e);
            })
            .finally(() => {
                clearMedia(filename);
            });
    };

    static path = async (message: Message, mediaPath: string, text = "") => {
        return send.media(message, MessageMedia.fromFilePath(mediaPath), text)
            .finally(() => {
                clearMedia(mediaPath);
            });
    };

    static url = async (message: Message, mediaUrl: string, text = "") => {
        return MessageMedia.fromUrl(mediaUrl, { unsafeMime: true })
            .then((media: MessageMedia) => {
                if (media.mimetype.includes("text/html")) {
                    return send.catch(message, "Invalid media url");
                }
                return send.media(message, media, text);
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

    static media = async (message: Message, media: MessageMedia, text = "") => {
        const mediaSize = media.data.length * 3 / 4 / 1024 / 1024;
        if (mediaSize > send.fileLimit) {
            send.document(message, media);
        } else {
            return message.reply(media, undefined, { caption: text })
                .then((replyMsg: Message) => {
                    react.success(message);
                    return replyMsg;
                })
                .catch((e) => {
                    react.error(message);
                    send.error(message, e);
                });
        }
    };

    static document = async (message: Message, media: MessageMedia) => {
        return message.reply(media, undefined, { sendMediaAsDocument: true })
            .then((replyMsg: Message) => {
                react.success(message);
                return replyMsg;
            })
            .catch((e) => {
                react.error(message);
                send.error(message, e);
            });
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
