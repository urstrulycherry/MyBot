import WAWebJS from "whatsapp-web.js";
import axios from "axios";
import { send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    const error = "Something went wrong, please try again later";
    try {
        console.log("Jokes");
        const joke = await axios("https://v2.jokeapi.dev/joke/programming")
            .then(res => res.data);
        if (joke.delivery) {
            const m = await send.text(message, options, joke.setup);
            setTimeout(() => {
                if (!m) {
                    return send.text(message, options, joke.delivery);
                }
                send.text(m, options, joke.delivery, false);
            }, 2000);
        } else {
            send.text(message, options, joke.joke);
        }
    } catch (_) {
        send.catch(message, error);
    }
};

module.exports = {
    name: "joke",
    process
};
