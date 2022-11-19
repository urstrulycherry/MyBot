import WAWebJS from "whatsapp-web.js";
import { evaluate } from "mathjs";
import { send } from "../util/reply";
import { helper } from "../util/helper";

const invalidExp = "Invalid Expression";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("Calculator");
    const exp = await helper.getMsgFromBody(message);
    if (!exp) return send.catch(message);
    try {
        const result = evaluate(exp);
        send.text(message, options, result.toString());
    } catch (_) {
        send.catch(message, invalidExp);
    }
};

module.exports = {
    name: "calc",
    process
};
