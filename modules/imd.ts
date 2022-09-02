import WAWebJS, { MessageMedia } from "whatsapp-web.js"
import fs from "fs";
import { send } from "../util/reply";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
const instagramGetUrl = require("instagram-url-direct")

const invalidUrl = "Invalid url";
const noMedia = "No media found";
const process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
    console.log("imd");
    let url = message.body.split(" ")[1];
    if (!url) {
        if (message.hasQuotedMsg) {
            let chat = await message.getChat();
            await chat.fetchMessages({ limit: 500 });
            let quotedMsg = await message.getQuotedMessage();
            url = quotedMsg.body;
        }
    }
    if (!url) {
        send.text(message, invalidUrl);
        return;
    }
    trigger(url, message);
}

const getSingleImageUrl = (imgData: any) => {
    let x = imgData.graphql.shortcode_media.display_url
    return [x];
}

const getSingleVideoUrl = (videoData: any) => {
    let x = videoData.graphql.shortcode_media.video_url
    return [x];
}

const getCaroselMedia = async (caroselData: any) => {
    let x = caroselData.graphql.shortcode_media.edge_sidecar_to_children.edges
    const urls = x.map((item: any) => {
        return item.node.isVideo ? item.node.video_url : item.node.display_url
    })
    return urls;
}

const getLinks = async (url: string, message: WAWebJS.Message) => {
    return axios.get(url).then((res: any) => {
        const isImage = res.data.graphql.shortcode_media.__typename === 'GraphImage'
        const isVideo = res.data.graphql.shortcode_media.__typename === 'GraphVideo'
        const isCarousel = res.data.graphql.shortcode_media.__typename === 'GraphSidecar'
        if (isImage) {
            return getSingleImageUrl(res.data)
        } else if (isVideo) {
            return getSingleVideoUrl(res.data)
        } else if (isCarousel) {
            return getCaroselMedia(res.data)
        }
        else {
            return []
        }
    })

}

const createrlUrl = (id: string) => {
    let url = "https://www.instagram.com/p/" + id + "/?__a=1&__d=dis";
    return url;
}

const isValidURL = (s: string) => {
    try {
        let url = new URL(s);
        if (url.hostname == "www.instagram.com") {
            let path = url.pathname.split("/");
            if ((path.length == 4 || path.length == 3) && (path[1] == "reel" || path[1] == "p")) {
                return true;
            }
        }
        return false
    } catch (err) {
        return false;
    }
};

const getIdFromUrl = (url: string) => {
    let urlObj = new URL(url);
    let id = urlObj.pathname.split("/")[2];
    return id;
}

const trigger = (url: string, message: WAWebJS.Message) => {
    if (isValidURL(url)) {
        let id = getIdFromUrl(url);
        let newUrl = createrlUrl(id);
        getLinks(newUrl, message).then((res: []) => {
            if (res.length == 0) {
                send.text(message, noMedia);
                return
            }
            res.forEach((item: string, i) => {
                setTimeout(async () => {
                    await send.mediaUrl(message, item);
                }, i * 2000)
            })
        }).catch((err: any) => {
            send.text(message, invalidUrl);
        })
    } else {
        send.text(message, invalidUrl);
    }
}

module.exports = {
    name: "imd",
    process
}