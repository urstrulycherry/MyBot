import WAWebJS from "whatsapp-web.js";
import { send } from "../../util/reply";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const instagramGetUrl = require("instagram-url-direct");
const noMedia = "No media found";

export const imd = async (message: WAWebJS.Message, url: string) => {
    const response = await instagramGetUrl(url);
    if (response.results_number > 0) {
        response.url_list.forEach((mediaUrl: string) => {
            send.url(message, mediaUrl);
        });
    } else {
        send.catch(message, noMedia);
    }
};
