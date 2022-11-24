import WAWebJS from "whatsapp-web.js";
import { tmd } from "./socialMedia/tmd";
// import { imd } from "./socialMedia/imd";
import { send } from "../util/reply";
import { yt } from "./socialMedia/yt";
import { helper } from "../util/helper";
const noUrlFound = "No Urls found";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("Media Download");
    const msg = await helper.getMsgFromBody(message);
    if (!msg) return send.catch(message);
    const links = helper.getLinksFromString(msg);
    if (links.length === 0) {
        return send.catch(message, noUrlFound);
    }
    links.forEach(link => {
        const url = new URL(link);
        if (url.hostname === "twitter.com") {
            tmd(message, options, link);
        } else if (url.hostname === "www.instagram.com") {
            send.catch(message, "Instagram is not available right now");
            // imd(message, options, link);
        } else if (url.hostname === "www.youtube.com" || url.hostname === "youtu.be" || url.hostname === "youtube.com" || url.hostname === "m.youtube.com") {
            yt(message, options, link);
        } else {
            send.url(message, options, link);
        }
    });
};

module.exports = {
    name: "md",
    process
};
