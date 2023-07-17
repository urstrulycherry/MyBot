/* eslint-disable @typescript-eslint/no-explicit-any */
import WAWebJS from "whatsapp-web.js";
import { parse } from "url";
import { Send } from "../../util/reply";
import * as dotenv from "dotenv";
import Twitter from "twitter";

dotenv.config();

const noMedia = "No media found";
const invalid = "Invalid url/Something went wrong";

export const tmd = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, url: string) => {
    try {
        let urls: string[] = [];
        let text = "";
        if (process.env.BEARER_TOKEN && process.env.CONSUMER_KEY && process.env.CONSUMER_SECRET) {
            const mediaInfo = await getMediaInfoWithToken(url);
            if (!mediaInfo) return Send.catch(message, noMedia);
            urls = mediaInfo.urls;
            text = mediaInfo.text;
        } else {
            return Send.catch(message, invalid);
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
    return getTweetInfo(url)?.then((tweetInfo) => {
        if (!tweetInfo) return undefined;
        return tweetInfo;
    }).catch((e: any) => {
        return e.message;
    });
};


const getTweetIdFromUrl = (tweetUrl: string): string => {
    const parsedUrl = parse(tweetUrl);
    if (!parsedUrl.pathname) return "";
    const path = parsedUrl.pathname.split("/");
    return path[path.length - 1];
};

const getTweetInfo = (tweetUrl: string) => {
    if (!process.env.BEARER_TOKEN || !process.env.CONSUMER_KEY || !process.env.CONSUMER_SECRET) return undefined;
    const client = new Twitter({
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        bearer_token: process.env.BEARER_TOKEN
    });
    const tweetId = getTweetIdFromUrl(tweetUrl);
    if (!tweetId) return undefined;
    const urls: string[] = [];
    let text = "";
    return new Promise((resolve, reject) => {
        client.get("statuses/show", { id: tweetId, tweet_mode: "extended" }, (error: any, tweet: any,) => {
            if (!error) {
                text = tweet.full_text.replace(/https:\/\/t.co\/[a-zA-Z0-9]+/g, "");
                if (tweet.extended_entities?.media?.length > 0) {
                    tweet.extended_entities.media.forEach((media: any) => {
                        if (media.video_info) {
                            const highestBitrateUrl = media.video_info.variants.reduce((prev: any, variant: any) => {
                                return (variant.content_type === "video/mp4" && variant.bitrate > prev.bitrate) ? variant : prev;
                            });
                            urls.push(highestBitrateUrl.url);
                        } else {
                            urls.push(media.media_url_https);
                        }
                    });
                } else {
                    reject(noMedia);
                }
                resolve({ urls, text });
            } else if (error) {
                reject(invalid);
            } else {
                reject(invalid);
            }
        });
    });
};
