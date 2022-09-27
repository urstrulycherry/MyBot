import WAWebJS from "whatsapp-web.js";
import { send } from "../../util/reply";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const twitterGetUrl = require("twitter-url-direct");

const noMedia = "No media found";

export const tmd = async (message: WAWebJS.Message, url: string) => {
    const response = await twitterGetUrl(url);
    if (response.found === true) {
        if (response.type === "video/gif") {
            const download: variants[] = response.download;
            let maxWidth = -1;
            let maxWidthIndex = -1;
            for (let i = 0; i < download.length; i++) {
                if (Number(download[i].width) >= maxWidth) {
                    maxWidth = Number(download[i].width);
                    maxWidthIndex = i;
                }
            }
            if (maxWidthIndex === -1) {
                send.text(message, noMedia);
                return;
            }
            const mediaUrl = download[maxWidthIndex].url;
            send.url(message, mediaUrl);
        } else if (response.type === "image") {
            const mediaUrl = response.download;
            send.url(message, mediaUrl);
        } else {
            send.text(message, noMedia);
        }
    } else {
        send.text(message, noMedia);
    }
};

type variants = {
    width: string,
    height: string,
    dimension: string,
    url: string
}
