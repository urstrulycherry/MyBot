import WAWebJS from "whatsapp-web.js";
import { Send } from "../../util/reply";

export const tmd = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, _url: string) => {
    console.log("Twitter Media Download");
    const url = new URL(_url);
    url.hostname = "d.fxtwitter.com";
    url.search = "";
    console.log(url.href);
    Send.url(message, options, url.href);
};
