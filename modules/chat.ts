import WAWebJS from "whatsapp-web.js";
import { Send } from "../util/reply";
import axios from "axios";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("chatGPT");
    let url = "https://bot.sreecharan.in/chatbot?message=";
    const msg = message.body.slice(3);
    url += encodeURIComponent(msg);
    if (url.length > 2000) return Send.catch(message, "Message too long");
    try {
        const res = await axios(url).then(res1 => res1.data);
        return Send.text(message, options, res.response);
    } catch (error) {
        return Send.catch(message, "Something went wrong, please try again later");
    }
};

module.exports = {
    name: "q",
    process
};
