import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("get media");
    const noMedia = "No media found";
    if (!message.hasQuotedMsg) return;

    const chat = await message.getChat();
    await chat.fetchMessages({ limit: 500 });
    console.log("before get quoted message");
    const quotedMsg = await message.getQuotedMessage();
    console.log("after get quoted message");
    if (!quotedMsg) {
        send.text(message, noMedia);
        return;
    }
    if (quotedMsg.hasMedia) {
        console.log("before download media");
        const media = await quotedMsg.downloadMedia().catch(() => {
            send.text(message, noMedia);
            return;
        });
        console.log("after download media");
        if (!media) return;
        send.media(message, media);
    } else {
        send.text(message, quotedMsg.body);
    }
};

module.exports = {
    name: "gm",
    process
};
