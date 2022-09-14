import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const instagramGetUrl = require("instagram-url-direct");

const invalidUrl = "Invalid url";
const noMedia = "No media found";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("imd");
    let links: string[] = [];
    if (message.body.split(" ").length > 1) {
        links = getLinksFromString(message.body);
    } else if (message.hasQuotedMsg) {
        const chat = await message.getChat();
        await chat.fetchMessages({ limit: 500 });
        const quotedMsg = await message.getQuotedMessage();
        links = getLinksFromString(quotedMsg.body);
    } else {
        send.text(message, invalidUrl);
        return;
    }

    if (links.length > 0) {
        trigger(links, message);
    } else {
        send.text(message, invalidUrl);
    }
};

const trigger = async (links: string[], message: WAWebJS.Message) => {
    for (let i = 0; i < links.length; i++) {
        const url = links[i];
        const response = await instagramGetUrl(url);
        if (response.results_number > 0) {
            response.url_list.forEach((mediaUrl: string) => {
                send.mediaUrl(message, mediaUrl);
            });
        } else {
            send.text(message, noMedia);
        }
    }
};

const getLinksFromString = (str: string) => {
    const links: string[] = [];
    const words: string[] = str.split(/\s+/g);
    for (let i = 0; i < words.length; i++) {
        if (isValidHttpUrl(words[i])) {
            links.push(words[i]);
        }
    }
    return links;
};

const isValidHttpUrl = (u: string) => {
    let url: URL;
    try {
        url = new URL(u);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
};

/*
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("imd");
    let url = message.body.split(" ")[1];
    if (!url) {
        if (message.hasQuotedMsg) {
            const chat = await message.getChat();
            await chat.fetchMessages({ limit: 500 });
            const quotedMsg = await message.getQuotedMessage();
            url = quotedMsg.body;
        }
    }
    if (!url) {
        send.text(message, invalidUrl);
        return;
    }
    trigger(url, message);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSingleImageUrl = (imgData: any) => {
    const x = imgData.graphql.shortcode_media.display_url;
    return [x];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSingleVideoUrl = (videoData: any) => {
    const x = videoData.graphql.shortcode_media.video_url;
    return [x];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCaroselMedia = async (caroselData: any) => {
    const x = caroselData.graphql.shortcode_media.edge_sidecar_to_children.edges;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const urls = x.map((item: any) => {
        return item.node.is_video ? item.node.video_url : item.node.display_url;
    });
    return urls;
};

const getLinks = async (url: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return axios.get(url).then((res: any) => {
        const isImage = res.data.graphql.shortcode_media.__typename === "GraphImage";
        const isVideo = res.data.graphql.shortcode_media.__typename === "GraphVideo";
        const isCarousel = res.data.graphql.shortcode_media.__typename === "GraphSidecar";
        if (isImage) {
            return getSingleImageUrl(res.data);
        } else if (isVideo) {
            return getSingleVideoUrl(res.data);
        } else if (isCarousel) {
            return getCaroselMedia(res.data);
        }

        return [];
    });
};

const createrlUrl = (id: string) => {
    const url = `https://www.instagram.com/p/${id}/?__a=1&__d=dis`;
    return url;
};

const isValidURL = (s: string) => {
    try {
        const url = new URL(s);
        if (url.hostname === "www.instagram.com") {
            const path = url.pathname.split("/");
            if ((path.length === 4 || path.length === 3) && (path[1] === "reel" || path[1] === "p")) {
                return true;
            }
        }
        return false;
    } catch (err) {
        return false;
    }
};

const getIdFromUrl = (url: string) => {
    const urlObj = new URL(url);
    const id = urlObj.pathname.split("/")[2];
    return id;
};

const trigger = (url: string, message: WAWebJS.Message) => {
    if (isValidURL(url)) {
        const id = getIdFromUrl(url);
        const newUrl = createrlUrl(id);
        getLinks(newUrl).then((res: []) => {
            if (res.length === 0) {
                send.text(message, noMedia);
                return;
            }
            res.forEach((item: string, i) => {
                setTimeout(async () => {
                    await send.mediaUrl(message, item);
                }, i * 2000);
            });
        }).catch(() => {
            send.text(message, invalidUrl);
        });
    } else {
        send.text(message, invalidUrl);
    }
};
*/

module.exports = {
    name: "imd",
    process
};
