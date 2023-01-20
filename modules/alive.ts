import WAWebJS from "whatsapp-web.js";
import { Send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("alive");
    Send.text(message, options, "Huh and you..?");
};

module.exports = {
    name: "alive",
    process
};
