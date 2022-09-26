import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("get media");

    if (!message.hasQuotedMsg) return;

    const chat = await message.getChat();
    await chat.fetchMessages({ limit: 500 });
    const quotedMsg = await message.getQuotedMessage();

    if (quotedMsg.hasMedia) {
        const media = await quotedMsg.downloadMedia();
        send.media(message, media);
    } else {
        send.text(message, quotedMsg.body);
    }
};

module.exports = {
    name: "gm",
    process
};
