import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("alive");
    send.text(message, "Huh and you..?");
};

module.exports = {
    name: "alive",
    process
};
