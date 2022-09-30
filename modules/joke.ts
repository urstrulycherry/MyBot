import WAWebJS from "whatsapp-web.js";
import axios from "axios";
import { send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    const error = "Something went wrong, please try again later";
    try {
        console.log("Jokes");
        const joke = await axios("https://v2.jokeapi.dev/joke/programming")
            .then(res => res.data);
        if (joke.delivery) {
            const m = await message.reply(joke.setup);
            setTimeout(() => {
                m.reply(joke.delivery);
            }, 2000);
        } else {
            send.text(message, joke.joke);
        }
    } catch (_) {
        send.text(message, error);
    }
};

module.exports = {
    name: "joke",
    process
};
