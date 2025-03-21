import WAWebJS from "whatsapp-web.js";
import { Helper } from "../util/helper";
import { Send } from "../util/reply";

const incorrect = "Incorrect currency code";
const error = "Something went wrong, please try again later";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    console.log("economy");

    try {
        const msg = message.body.split(Helper.spliter).slice(1).join(" ");
        const [amount, from, to] = getAmountAndCurrencies(msg);
        const result = await trigger(amount, from, to);
        if (result) {
            Send.text(message, options, result);
        } else {
            Send.catch(message, incorrect);
        }
    } catch (_) {
        Send.catch(message, error);
    }
};

const trigger = async (amount: string, cur1: string, cur2: string) => {
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${cur1}.json`.toLowerCase();
    const res = await fetch(url).then((_res) => {
        return _res.json();
    }).then((data) => {
        return data;
    }).catch((_) => {
        return;
    });

    if (!res) return;

    let msg = `Date: ${res.date}\n1 ${cur1.toUpperCase()} = ${res[cur1][cur2]} ${cur2.toUpperCase()}`;
    if (amount !== "1") msg += `\n${amount} ${cur1.toUpperCase()} = ${(res[cur1][cur2] * +amount).toFixed(2)} ${cur2.toUpperCase()}`;

    return msg;
};

const getAmountAndCurrencies = (text: string): (string)[] => {
    const words = text.trim().split(Helper.spliter);
    const amount = words[0] || "1";
    const from = (words.length === 3 ? words[1] : "inr").toLowerCase();
    const to = (words.length >= 2 ? words[words.length - 1] : "usd").toLowerCase();
    return [amount, from, to];
};

module.exports = {
    name: "curr",
    process
};
