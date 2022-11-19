import WAWebJS from "whatsapp-web.js";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parseUrl, getDetails } = require("twitter-url");
import { send } from "../../util/reply";

const noMedia = "No media found";

export const tmd = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, url: string) => {
    try {
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
        if (urls.length === 0) {
            return send.catch(message, noMedia);
        }
        for (let i = 0; i < urls.length; i++) {
            if (!urls[i]) continue;
            if (i === 0) {
                await send.url(message, options, urls[i], text);
            } else {
                await send.url(message, options, urls[i]);
            }
        }
    } catch (e) {
        send.catch(message, "Something went wrong");
    }
};
