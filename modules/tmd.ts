const URL = require("url").URL;
import WAWebJS, { MessageMedia } from "whatsapp-web.js"
import { v4 as uuidv4 } from 'uuid';
import { send } from "../util/reply";
import fs from "fs";
const twitterGetUrl = require("twitter-url-direct")

const invalidUrl = "Invalid url";
const noMedia = "No media found";
const error = "Something went wrong";

const process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
    console.log("tmd");
    let url = message.body.split(" ")[1];
    if (!isValidURL(url) && !message.hasQuotedMsg) {
        send.text(message, invalidUrl).catch(() => { return })
        return;
    }
    if (!isValidURL(url)) {
        let chat = await message.getChat();
        await chat.fetchMessages({ limit: 500 });
        let quotedMsg = await message.getQuotedMessage();
        if (isValidURL(quotedMsg.body)) {
            url = quotedMsg.body;
        }
    }
    if (url) {
        trigger(getUrl(url), message);
    } else {
        send.text(message, invalidUrl).catch(() => { return })
    }
}

const trigger = async (url: string, message: WAWebJS.Message) => {
    let response = await twitterGetUrl(url);
    if (response.found == true) {
        if (response.type == "video/gif") {
            let download: variants[] = response.download;
            let maxWidth = -1;
            let maxWidthIndex = -1;
            for (let i = 0; i < download.length; i++) {
                if (Number(download[i].width) >= maxWidth) {
                    maxWidth = Number(download[i].width);
                    maxWidthIndex = i;
                }
            }
            if (maxWidthIndex == -1) {
                send.text(message, noMedia);
                return;
            }
            let url = download[maxWidthIndex].url;
            MessageMedia.fromUrl(url, { unsafeMime: true }).then((media: MessageMedia) => {
                if (!media.filename) {
                    media.filename = uuidv4() + ".mp4";
                }
                let mediaPath = "./media/videos/" + media.filename;
                fs.writeFileSync(mediaPath, media.data, "base64");
                send.media(message, mediaPath).catch(() => { return });
            }).catch(() => {
                send.text(message, error).catch(() => { return })
            });
        } else if (response.type == "image") {
            let url = response.download;
            MessageMedia.fromUrl(url, { unsafeMime: true }).then((media: MessageMedia) => {
                if (!media.filename) {
                    media.filename = uuidv4() + ".jpeg";
                }
                let mediaPath = "./media/images/" + media.filename;
                fs.writeFileSync(mediaPath, media.data, "base64");
                send.media(message, mediaPath).catch(() => { return });
            })
        } else {
            send.text(message, noMedia);
        }
    } else {
        send.text(message, noMedia);
    }
}


type variants = {
    width: string,
    height: string,
    dimension: string,
    url: string
}

const getUrl = (url: string) => {
    return new URL(url).href;
}

const isValidURL = (s: string) => {
    try {
        let url = new URL(s);
        if (url.hostname == "twitter.com") {
            let path = url.pathname.split("/");
            if (path.length == 4 && path[2] == "status") {
                return true;
            }
        }
        return false
    } catch (err) {
        return false;
    }
};

module.exports = {
    name: "tmd",
    process
}