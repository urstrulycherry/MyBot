import WAWebJS from "whatsapp-web.js";
import { Send } from "../util/reply";
import axios from "axios";
import { Helper } from "../util/helper";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("chatGPT");
    let url = "https://worker-gentle-pond-0dae.sree-charan-account.workers.dev/?question=";
    const msg = await Helper.getMsgFromBody(message);
    if (!msg) return Send.catch(message, "Please provide a message");
    url += `${encodeURIComponent(msg)}?`;
    if (url.length > 2000) return Send.catch(message, "Message too long");
    try {
        const result = await axios(url).then(res1 => res1.data);
        const response = result[0].response.response;
        if (!response) Send.catch(message, "Something went wrong, please try again later");
        return Send.text(message, options, response.trim());
    } catch (error) {
        return Send.catch(message, "Something went wrong, please try again later");
    }
};

module.exports = {
    name: "q",
    process
};
