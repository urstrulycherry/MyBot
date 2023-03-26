/* eslint-disable */
import WAWebJS from "whatsapp-web.js";
import { Helper } from "../util/helper";
import { React } from "../util/reply";

const process = async (message: WAWebJS.Message, client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("delete");
    if (!message.hasQuotedMsg) return React.warning(message);
    const chat = await message.getChat();
    if (!chat.isGroup && !message.fromMe) return React.warning(message);
    await chat.fetchMessages({ limit: 500 });
    const quotedMsg = await message.getQuotedMessage();
    if (!chat.isGroup && !quotedMsg.fromMe) return React.warning(message);
    const res = await trigger(quotedMsg, client);
    if (!res) {
        return React.warning(message);
    }
    React.success(message);
    if (!message.body.includes("-s")) return;
    await new Promise((resolve) => setTimeout(resolve, 1200));
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