import WAWebJS from "whatsapp-web.js";
import { Send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("get media");
    const noMedia = "No media found";
    if (!message.hasQuotedMsg) return Send.catch(message);
    const messageCaption = message.body.split(" ").slice(1).join(" ");
    const chat = await message.getChat();
    await chat.fetchMessages({ limit: 500 });
    const quotedMsg = await message.getQuotedMessage().catch(() => {
        return Send.catch(message);
    });
    if (!quotedMsg) {
        Send.catch(message, noMedia);
        return Send.catch(message);
    }
    if (quotedMsg.hasMedia) {
        const media = await quotedMsg.downloadMedia().catch(() => {
            Send.catch(message);
            return;
        });
        if (!media) {
            return Send.catch(message);
        }
        Send.media(message, options, media, messageCaption || quotedMsg.body);
    } else {
        if (!quotedMsg.body) {
            return Send.catch(message, noMedia);
        }
        return Send.text(message, options, quotedMsg.body);
    }
};

module.exports = {
    name: "gm",
    process
};
