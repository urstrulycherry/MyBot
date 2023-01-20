import WAWebJS from "whatsapp-web.js";
import { evaluate } from "mathjs";
import { Send } from "../util/reply";
import { Helper } from "../util/helper";

const invalidExp = "Invalid Expression";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("Calculator");
    const exp = await Helper.getMsgFromBody(message);
    if (!exp) return Send.catch(message);
    try {
        const result = evaluate(exp);
        Send.text(message, options, result.toString());
    } catch (_) {
        Send.catch(message, invalidExp);
    }
};

module.exports = {
    name: "calc",
    process
};
