import WAWebJS from "whatsapp-web.js";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { parse } from "url";
import axios from "axios";
import { Send } from "../../util/reply";

const noMedia = "No media found";
const invalid = "Invalid url/Something went wrong";
const invalidToken = "Invalid bearer token";

export const tmd = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, url: string) => {
    if (!process.env.BEARER_TOKEN) return Send.catch(message, invalidToken);
    try {
        const urls: string[] = [];
        const tweetInfo = await getTweetInfo(url);
        if (tweetInfo.status !== 200) return Send.catch(message, invalid);
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
