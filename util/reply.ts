import WAWebJS, { Message, MessageMedia } from "whatsapp-web.js";
import fs from "fs";
import pdfkit from "pdfkit";

export class Send {
    static fileLimit = 15.5;
    static text = async (message: Message, options: WAWebJS.MessageSendOptions, text: string, needReact = true) => {
        const formatter = "```";
        if (text.startsWith(formatter) && text.endsWith(formatter)) {
            text = text.substring(formatter.length, text.length - formatter.length);
        }
        return message.reply(`${formatter}${text}${formatter}`, undefined, options)
            .then((replyMsg: Message) => {
                if (needReact) {
                    react.success(message);
                }
                return replyMsg;
            })
            .catch((e) => {
                react.error(message);
                Send.error(message, e);
            });
    };

    static formattedText = async (message: Message, options: WAWebJS.MessageSendOptions, text: string, needReact = true) => {
        return message.reply(text, undefined, options)
            .then((replyMsg: Message) => {
                if (needReact) {
                    react.success(message);
                }
                return replyMsg;
            })
            .catch((e) => {
                react.error(message);
                Send.error(message, e);
            });
    };

    static sticker = async (message: Message, options: WAWebJS.MessageSendOptions, stickerMedia: MessageMedia) => {
        const filename = `./media/stickers/${message.id._serialized}.webp`;
        const buff = Buffer.from(stickerMedia.data, "base64");
        fs.writeFileSync(filename, buff);
        options.sendMediaAsSticker = true;
        return message.reply(MessageMedia.fromFilePath(filename), undefined, options)
            .then((replyMsg: Message) => {
                react.success(message);
                return replyMsg;
            })
            .catch((e) => {
                react.error(message);
                Send.error(message, e);
            })
            .finally(() => {
                clearMedia(filename);
            });
    };

    static path = async (message: Message, options: WAWebJS.MessageSendOptions, mediaPath: string, text = "") => {
        return Send.media(message, options, MessageMedia.fromFilePath(mediaPath), text)
            .finally(() => {
                clearMedia(mediaPath);
            });
    };

    static url = async (message: Message, options: WAWebJS.MessageSendOptions, mediaUrl: string, text = "") => {
        return MessageMedia.fromUrl(mediaUrl, { unsafeMime: true })
            .then((media: MessageMedia) => {
                if (media.mimetype.includes("text/html")) {
                    return Send.catch(message, "Invalid media url");
                }
                return Send.media(message, options, media, text);
            }).catch((e) => {
                Send.error(message, e);
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

    static media = async (message: Message, options: WAWebJS.MessageSendOptions, media: MessageMedia, text = "") => {
        const mediaSize = media.data.length * 3 / 4 / 1024 / 1024;
        if (mediaSize > Send.fileLimit) {
            Send.document(message, options, media);
        } else {
            options.caption = text;
            return message.reply(media, undefined, options)
                .then((replyMsg: Message) => {
                    react.success(message);
                    return replyMsg;
                })
                .catch((e) => {
                    react.error(message);
                    Send.error(message, e);
                });
        }
    };

    static document = async (message: Message, options: WAWebJS.MessageSendOptions, media: MessageMedia) => {
        options.sendMediaAsDocument = true;
        return message.reply(media, undefined, options)
            .then((replyMsg: Message) => {
                react.success(message);
                return replyMsg;
            })
            .catch((e) => {
                react.error(message);
                Send.error(message, e);
            });
    };

    static pdf = async (message: Message, options: WAWebJS.MessageSendOptions, files: string[], fileName?: string) => {
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
            return this.path(message, options, path);
        }).on("error", (e: Error) => {
            this.error(message, e);
        });
    };

    static catch = async (message: Message, text = "") => {
        react.warning(message);
        if (!text || text === "") return;
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
