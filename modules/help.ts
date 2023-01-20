import WAWebJS from "whatsapp-web.js";
import { Helper } from "../util/helper";
import { Modules, config } from "../util/modules";
import { Send } from "../util/reply";

let fromMe = false;
const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, options: WAWebJS.MessageSendOptions) => {
    const body = await Helper.getMsgFromBody(message);
    let res: string;
    fromMe = message.fromMe;
    if (!body) {
        res = "List of all modules:\n";
        res += getAllModulesInfo();
    } else {
        res = getModuleFullInfo(body);
        if (!res) res = "Module not found! (or you don't have permission to use it)";
    }
    Send.formattedText(message, options, res);
};

const getAllModulesInfo = () => {
    const modules = Modules.commands.keys();
    let res = "";
    for (const module of modules) {
        res += getModuleInfo(module);
    }
    return res;
};

const getModuleInfo = (command: string) => {
    let res = "";
    if (Modules.isModuleAvailable(command, fromMe)) {
        if (Modules.commands.has(command)) {
            res += `\n➼ *${command}*\n`;
            res += `Description: _${config[command].info}_\n`;
        }
    }
    return res;
};

const getModuleFullInfo = (command: string) => {
    let res = "";
    if (Modules.isModuleAvailable(command, fromMe)) {
        if (Modules.commands.has(command)) {
            res += `➼ *${command}*\n`;
            res += `Description: _${config[command].info}_\n`;
            res += `Usage: _${config[command].usage}_\n`;
            res += `Example: _${config[command].example}_\n`;
        }
    }
    return res;
};

module.exports = {
    name: "help",
    process
};
