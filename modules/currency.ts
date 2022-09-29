import axios from "axios";
import WAWebJS from "whatsapp-web.js";
import { send } from "../util/reply";

const incorrect = "Incorrect currency code";
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("economy");
    const msg = message.body.split(" ").slice(1).join(" ");
    const arr = msg.split(" ").filter((item) => item.trim());
    const [cur1, cur2] = arr;
    if (!cur1) {
        send.text(message, "Please provide currency code(s)");
        return;
    }
    const res = (!cur2) ? await trigger(cur1, undefined) : await trigger(cur1, cur2);
    if (!res) {
        send.text(message, incorrect);
        return;
    }
    send.text(message, res);
};

const trigger = async (cur1: string, cur2: string | undefined) => {
    const url = cur2 ? `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${cur1}/${cur2}.json`.toLowerCase()
        : `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/inr/${cur1}.json`.toLowerCase();
    const res = await axios.get(url).catch(() => {
        return null;
    });

    if (!res) return;

    if (res.status !== 200) {
        return null;
    }
    const msg = cur2 ? `Date: ${res.data.date}\n1 ${cur1.toUpperCase()} = ${res.data[cur2.toLowerCase()]} ${cur2.toUpperCase()}`
        : `Date: ${res.data.date}\n1 INR = ${res.data[cur1.toLowerCase()]} ${cur1.toUpperCase()}`;
    return msg;
};

module.exports = {
    name: "currency",
    process
};
