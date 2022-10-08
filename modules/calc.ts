import WAWebJS from "whatsapp-web.js";
import { evaluate } from "mathjs";
import { send } from "../util/reply";

const invalidExp = "Invalid Expression";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("Calculator");
    let exp: string | null = null;
    if (message.body.split(/\s+/g).length > 1) {
        exp = message.body.split(/\s+/g).slice(1).join(" ");
    } else if (message.hasQuotedMsg) {
        const chat = await message.getChat();
        await chat.fetchMessages({ limit: 500 });
        const quotedMsg = await message.getQuotedMessage();
        exp = quotedMsg.body;
    }
    if (!exp) return;
    try {
        const result = evaluate(exp);
        send.text(message, result.toString());
    } catch (_) {
        send.text(message, invalidExp);
    }
};

module.exports = {
    name: "calc",
    process
};
