import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("get media");
    const noMedia = "No media found";
    if (!message.hasQuotedMsg) return send.catch(message);

    const chat = await message.getChat();
    await chat.fetchMessages({ limit: 500 });
    const quotedMsg = await message.getQuotedMessage();
    if (!quotedMsg) {
        send.catch(message, noMedia);
        return send.catch(message);
    }
    if (quotedMsg.hasMedia) {
        const media = await quotedMsg.downloadMedia().catch(() => {
            send.catch(message);
            return;
        });
        if (!media) {
            return send.catch(message);
        }
        options.caption = quotedMsg.body;
        send.media(message, options, media);
    } else {
        if (!quotedMsg.body) {
            return send.catch(message, noMedia);
        }
        return send.text(message, options, quotedMsg.body);
    }
};

module.exports = {
    name: "gm",
    process
};
