import WAWebJS from "whatsapp-web.js";
import { parse } from "url";
import axios from "axios";
import { Send } from "../../util/reply";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parseUrl, getDetails } = require("twitter-url");

const noMedia = "No media found";
const invalid = "Invalid url/Something went wrong";
const invalidToken = "Invalid bearer token";

export const tmd = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, url: string) => {
    try {
        let urls: string[] = [];
        let text = "";
        if (process.env.BEARER_TOKEN) {
            const mediaInfo = await getMediaInfoWithToken(url);
            if (!mediaInfo) return Send.catch(message, invalidToken);
            urls = mediaInfo.urls;
            text = mediaInfo.text;
        } else {
            const mediaInfo = await getMediaInfoWithoutToken(url);
            urls = mediaInfo.urls;
            text = mediaInfo.text;
        }
        if (urls.length === 0) {
            return Send.catch(message, noMedia);
        }
        for (let i = 0; i < urls.length; i++) {
            if (!urls[i]) continue;
            if (i === 0) {
                await Send.url(message, options, urls[i], text);
            } else {
                await Send.url(message, options, urls[i]);
            }
        }
    } catch (e) {
        Send.catch(message, invalid);
    }
};


const getMediaInfoWithToken = async (url: string) => {
    const urls: string[] = [];
    const tweetInfo = await getTweetInfo(url);
    if (tweetInfo.status !== 200) return;
    const text = tweetInfo.data.data[0].text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "").trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tweetInfo.data.includes.media.forEach((media: any) => {
        if (media.type === "photo") {
            urls.push(media.url);
        } else if (media.type === "video") {
            let maxBitRate = 0;
            let maxBitRateUrl = "";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            media.variants.forEach((variant: any) => {
                if (variant.bit_rate > maxBitRate) {
                    maxBitRate = variant.bit_rate;
                    maxBitRateUrl = variant.url;
                }
            });
            urls.push(maxBitRateUrl);
        }
    });
    return { urls, text };
};

const getMediaInfoWithoutToken = async (url: string) => {
    const urls = [];
    const { id } = parseUrl(url);
    const details = getDetails(id);
    const text = details.globalObjects.tweets[id].text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "").trim();
    for (let i = 0; i < details.globalObjects.tweets[id]?.extended_entities?.media?.length; i++) {
        if (details.globalObjects.tweets[id]?.extended_entities?.media[i]?.video_info) {
            let maxWidth = -1;
            let maxWidthIndex = -1;
            for (let j = 0; j < details.globalObjects.tweets[id].extended_entities?.media[i]?.video_info?.variants?.length; j++) {
                if (details.globalObjects.tweets[id].extended_entities.media[i].video_info.variants[j].content_type === "video/mp4") {
                    if (Number(details.globalObjects.tweets[id].extended_entities.media[i].video_info.variants[j].bitrate) >= maxWidth) {
                        maxWidth = Number(details.globalObjects.tweets[id].extended_entities.media[i].video_info.variants[j].bitrate);
                        maxWidthIndex = j;
                    }
                }
            }
            if (maxWidthIndex !== -1) {
                urls.push(details.globalObjects.tweets[id].extended_entities.media[i].video_info.variants[maxWidthIndex].url);
            }
        } else {
            urls.push(details.globalObjects.tweets[id].extended_entities.media[i].media_url_https);
        }
    }
    return { urls, text };
};

const getTweetIdFromUrl = (tweetUrl: string): string => {
    const parsedUrl = parse(tweetUrl);
    if (!parsedUrl.pathname) return "";
    const path = parsedUrl.pathname.split("/");
    return path[path.length - 1];
};

const getTweetInfo = async (tweetUrl: string) => {
    const options = {
        method: "GET",
        url: "https://api.twitter.com/2/tweets",
        params: {
            ids: getTweetIdFromUrl(tweetUrl),
            expansions: "attachments.media_keys",
            "media.fields": "media_key,variants,type,url"
        },
        headers: {
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`
        }
    };
    return axios.request(options);
};
