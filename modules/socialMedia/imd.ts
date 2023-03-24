import WAWebJS from "whatsapp-web.js";
import { Send } from "../../util/reply";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const instagramGetUrl = require("instagram-url-direct");
const noMedia = "No media found";
const error = "Something went wrong, please try again later";
export const imd = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, url: string) => {
    type igRes = {
        results_number: number;
        url_list: string[];
    }
    instagramGetUrl(url).then((res: igRes) => {
        if (res.results_number > 0) {
            res.url_list.forEach((mediaUrl: string) => {
                if (mediaUrl.includes("https://media.instasupersave.com")) {
                    mediaUrl = decodeURIComponent(mediaUrl).split("uri=")[1].split("&filename=")[0];
                }
                Send.url(message, options, mediaUrl);
            });
        } else {
            Send.catch(message, noMedia);
        }
    }).catch(() => {
        Send.catch(message, error);
    });
};
