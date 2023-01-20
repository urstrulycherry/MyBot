import WAWebJS from "whatsapp-web.js";
import { Helper } from "../util/helper";
import { Send } from "../util/reply";

const incorrect = "Incorrect currency code";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("economy");
    const error = "Something went wrong, please try again later";
    try {
        const msg = await Helper.getMsgFromBody(message);
        if (!msg) return Send.catch(message);
        const arr = msg.split(" ").filter((item) => item.trim());
        const [cur1, cur2] = arr;
        if (!cur1) {
            return Send.catch(message, "Please provide currency code(s)");
        }
        const res = (!cur2) ? await trigger(cur1, undefined) : await trigger(cur1, cur2);
        if (!res) {
            return Send.catch(message, incorrect);
        }
        Send.text(message, options, res);
    } catch (_) {
        Send.catch(message, error);
    }
};

const trigger = async (cur1: string, cur2: string | undefined) => {
    const url = cur2 ? `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${cur1}/${cur2}.json`.toLowerCase()
        : `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/inr/${cur1}.json`.toLowerCase();
    const res = await fetch(url).then((_res) => {
        return _res.json();
    }).then((data) => {
        return data;
    }).catch((_) => {
        return;
    });

    if (!res) return;

    const msg = cur2 ? `Date: ${res.date}\n1 ${cur1.toUpperCase()} = ${res[cur2.toLowerCase()]} ${cur2.toUpperCase()}`
        : `Date: ${res.date}\n1 INR = ${res[cur1.toLowerCase()]} ${cur1.toUpperCase()}`;
    return msg;
};

module.exports = {
    name: "curr",
    process
};
