/* eslint-disable */
import WAWebJS from "whatsapp-web.js";
import { Helper } from "../util/helper";
import { react, Send } from "../util/reply";

const process = async (message: WAWebJS.Message, client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("delete");
    if (!message.hasQuotedMsg) return react.warning(message);
    const chat = await message.getChat();
    if (!chat.isGroup && !message.fromMe) return react.warning(message);
    await chat.fetchMessages({ limit: 500 });
    const quotedMsg = await message.getQuotedMessage();
    if (!chat.isGroup && !quotedMsg.fromMe) return react.warning(message);
    const res = await trigger(quotedMsg, client);
    if (!res) {
        return react.warning(message);
    }
    react.success(message);
    if (!message.body.includes("-s")) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
    await trigger(message, client);
}
const trigger = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
    const chat = await message.getChat();
    if (chat.isGroup) {
        if (await Helper.isAdmin(message, client)) {
            await message.delete(true);
            return true;
        } else {
            return false;
        }
    } else if (message.fromMe) {
        await message.delete(true);
        return true;
    } else {
        return false;
    }
}

module.exports = {
    name: "del",
    process
};