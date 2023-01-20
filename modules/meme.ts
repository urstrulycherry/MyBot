import WAWebJS from "whatsapp-web.js";
import axios from "axios";
import { Send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("Memes");
    const error = "Something went wrong, please try again later";
    try {
        const meme = await axios("https://meme-api.com/gimme")
            .then(res => res.data);
        Send.url(message, options, meme.url);
    } catch (_) {
        Send.catch(message, error);
    }
};

module.exports = {
    name: "meme",
    process
};
