import WAWebJS from "whatsapp-web.js";
import { tmd } from "./socialMedia/tmd";
import { imd } from "./socialMedia/imd";
import { send } from "../util/reply";
import { yt } from "./socialMedia/yt";
import { helper } from "../util/helper";
const noUrlFound = "No Urls found";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("Media Download");
    // let links: string[] = [];
    const msg = await helper.getMsgFromBody(message);
    if (!msg) return;
    const links = helper.getLinksFromString(msg);
    if (links.length === 0) {
        send.catch(message, noUrlFound);
        return;
    }
    links.forEach(link => {
        const url = new URL(link);
        if (url.hostname === "twitter.com") {
            tmd(message, link);
        } else if (url.hostname === "www.instagram.com") {
            imd(message, link);
        } else if (url.hostname === "www.youtube.com" || url.hostname === "youtu.be" || url.hostname === "youtube.com" || url.hostname === "m.youtube.com") {
            yt(message, link);
        } else {
            send.url(message, link);
        }
    });
};

module.exports = {
    name: "md",
    process
};
