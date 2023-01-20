import WAWebJS from "whatsapp-web.js";
import axios from "axios";
import { Send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    const error = "Something went wrong, please try again later";
    try {
        console.log("Jokes");
        const joke = await axios("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit")
            .then(res => res.data);
        if (joke.delivery) {
            const m = await Send.text(message, options, joke.setup);
            setTimeout(() => {
                if (!m) {
                    return Send.text(message, options, joke.delivery);
                }
                Send.text(m, options, joke.delivery, false);
            }, 2000);
        } else {
            Send.text(message, options, joke.joke);
        }
    } catch (_) {
        Send.catch(message, error);
    }
};

module.exports = {
    name: "joke",
    process
};
