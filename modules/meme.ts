import WAWebJS from "whatsapp-web.js";
import axios from "axios";
import { send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("Memes");
    const meme = await axios("https://meme-api.herokuapp.com/gimme")
        .then(res => res.data);
    send.url(message, meme.url);
};

module.exports = {
    name: "meme",
    process
};
