import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";
import axios from "axios";

const invalidUrl = "Invalid url";
const noMedia = "No media found";

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

module.exports = {
    name: "imd",
    process
};
