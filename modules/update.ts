import WAWebJS from "whatsapp-web.js";
import { Helper } from "../util/helper";
import { Modules } from "../util/modules";
import { Send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    const msg = await Helper.getMsgFromBody(message);
    if (!msg) {
        await Send.catch(message, "No message provided");
        return;
    }
    const [moduleName, available] = msg.split(" ");
    if (!moduleName || !available) {
        await Send.catch(message, "Invalid format");
        return;
    }
    Modules.updateConfig(moduleName, available).then(() => {
        Send.text(message, options, `Updated ${moduleName} to ${available}`);
    }).catch((err) => {
        Send.catch(message, err);
    });
};

module.exports = {
    name: "update",
    process
};
