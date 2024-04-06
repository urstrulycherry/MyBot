import WAWebJS from "whatsapp-web.js";
import { Send } from "../../util/reply";

export const tmd = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, _url: string) => {
    Send.text(message, options, "Coming soon...");
};
