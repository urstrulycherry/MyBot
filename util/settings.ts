import fs from "fs";
import { join } from "path";
import WAWebJS from "whatsapp-web.js";
import { Settings, Status } from "./global";
import { Helper } from "./helper";
import { Send } from "./reply";
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const settings: Settings = require("../data/settings.json");

export class SettingsManager {
    static setBotStatus = (status: string) => {
        if (!Object.values(Status).includes(status)) {
            return false;
        }
        settings.status = status;
        fs.writeFileSync(join(process.cwd(), "data", "settings.json"), JSON.stringify(settings, null, 4));
        return true;
    };

    static getBotStatus = () => {
        return settings.status;
    };

    static isRestricted = async (message: WAWebJS.Message) => {
        if (message.fromMe) return true;
        const user = await Helper.getAuthor(message);
        return settings.restricted.includes(user);
    };

    static addRestricted = async (participant: string, message: WAWebJS.Message) => {
        if (typeof settings.restricted === "string") return false;
        const number = participant;
        participant = `${participant}@c.us`;
        if (await this.isRestricted(message)) {
            if (!settings.restricted.includes(participant)) {
                settings.restricted.push(participant);
                fs.writeFileSync(join(process.cwd(), "data", "settings.json"), JSON.stringify(settings, null, 4));
                Send.text(message, {}, `Added ${number} to restricted list`);
            } else Send.catch(message, `${number} is already in restricted list`);
            return true;
        }
        Send.catch(message, "Error: You are not allowed to add to restricted list");
        return false;
    };

    static removeRestricted = async (participant: string, message: WAWebJS.Message) => {
        if (typeof settings.restricted === "string") return false;
        const number = participant;
        participant = `${participant}@c.us`;
        if (await this.isRestricted(message)) {
            if (settings.restricted.includes(participant)) {
                settings.restricted = settings.restricted.filter((aciveParticipant) => aciveParticipant !== participant);
                fs.writeFileSync(join(process.cwd(), "data", "settings.json"), JSON.stringify(settings, null, 4));
                Send.text(message, {}, `Removed ${number} from restricted list`);
            } else Send.catch(message, `${number} is not in restricted list`);
            return true;
        }
        Send.catch(message, "Error: You are not allowed to remove from restricted list");
        return false;
    };
}
