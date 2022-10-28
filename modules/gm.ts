import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("get media");
    const noMedia = "No media found";
    if (!message.hasQuotedMsg) return;

    const chat = await message.getChat();
    await chat.fetchMessages({ limit: 500 });
    const quotedMsg = await message.getQuotedMessage();
    if (!quotedMsg) {
        send.catch(message, noMedia);
        return;
    }
    if (quotedMsg.hasMedia) {
        const media = await quotedMsg.downloadMedia().catch(() => {
            send.catch(message, noMedia);
            return;
        });
        if (!media) {
            return send.catch(message, noMedia);
        }
        send.media(message, media);
    } else {
        if (!quotedMsg.body) {
            return send.catch(message, noMedia);
        }
        return send.text(message, quotedMsg.body);
    }
};

module.exports = {
    name: "gm",
    process
};
