import WAWebJS, { MessageSendOptions } from "whatsapp-web.js";
import { Executer, isTest, Status, testPrefix } from "./global";
import { Send } from "./reply";
import { SettingsManager } from "./settings";

export class Helper {
    static readonly spliter = /\s+/g;

    static readonly isValidHttpUrl = (u: string) => {
        let url: URL;
        try {
            url = new URL(u);
        } catch (_) {
            return false;
        }
        return url.protocol === "http:" || url.protocol === "https:";
    };

    static getLinksFromString = (str: string) => {
        const links: string[] = [];
        const words: string[] = str.split(/\s+/g);
        for (let i = 0; i < words.length; i++) {
            if (this.isValidHttpUrl(words[i])) {
                links.push(words[i]);
            }
        }
        return links;
    };

    static getMsgFromBody = async (message: WAWebJS.Message) => {
        try {
            if (message.body.split(this.spliter).length > 1) {
                return message.body.split(this.spliter).slice(1).join(" ");
            } else if (message.hasQuotedMsg) {
                const chat = await message.getChat();
                await chat.fetchMessages({ limit: 500 });
                const quotedMsg = await message.getQuotedMessage();
                return quotedMsg.body;
            }
        } catch (error) {
            return undefined;
        }
    };

    static getAdmins = async (message: WAWebJS.Message, client: WAWebJS.Client, groupChat: WAWebJS.GroupChat) => {
        const participants: WAWebJS.Contact[] = [];
        for (const participant of groupChat.participants) {
            if (participant.isAdmin) {
                participants.push(await client.getContactById(participant.id._serialized));
            }
        }
        return participants;
    };

    static getAllParticipants = async (message: WAWebJS.Message, client: WAWebJS.Client, groupChat: WAWebJS.GroupChat) => {
        const participants: WAWebJS.Contact[] = [];
        for (const participant of groupChat.participants) {
            participants.push(await client.getContactById(participant.id._serialized));
        }
        return participants;
    };

    static getNonAdmins = async (message: WAWebJS.Message, client: WAWebJS.Client, groupChat: WAWebJS.GroupChat) => {
        const participants: WAWebJS.Contact[] = [];
        for (const participant of groupChat.participants) {
            if (!participant.isAdmin) {
                participants.push(await client.getContactById(participant.id._serialized));
            }
        }
        return participants;
    };

    static processOptions = async (message: WAWebJS.Message, client: WAWebJS.Client, groupChat: WAWebJS.GroupChat) => {
        const executer = message.body[0];
        const options: MessageSendOptions = {};
        switch (executer) {
            case Executer.TagAll:
                options.mentions = await this.getAllParticipants(message, client, groupChat);
                break;
            case Executer.TagAdmins:
                options.mentions = await this.getAdmins(message, client, groupChat);
                break;
            case Executer.TagNonAdmins:
                options.mentions = await this.getNonAdmins(message, client, groupChat);
                break;
            default:
                break;
        }
        return options;
    };

    static isAdmin = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
        const chat = await message.getChat();
        if (!chat.isGroup) return false;
        const group: WAWebJS.GroupChat = chat as WAWebJS.GroupChat;
        let user: string | undefined;
        if (message.fromMe) {
            user = client.info.wid._serialized;
        } else {
            user = message.author;
        }
        if (!user) return false;
        const participants = group.participants;
        return participants.find((participant) => participant.id._serialized === user)?.isAdmin;
    };

    static getCommandName = (body: string) => {
        let command = body.split(this.spliter)[0];
        if (!command) return undefined;
        if (!command[0].match(/^[.!#$]/)) return undefined;
        command = command.slice(1);
        if (isTest) {
            if (!command.startsWith(testPrefix)) return undefined;
            command = command.slice(testPrefix.length);
        }
        return command;
    };

    static checkStatus = async (message: WAWebJS.Message, client: WAWebJS.Client): Promise<boolean> => {
        if (await this.checkSudo(message)) return false;

        switch (SettingsManager.getBotStatus()) {
            case Status.public:
                return true;
            case Status.admin:
                return !!(await Helper.isAdmin(message, client)) || message.fromMe;
            case Status.restricted:
                return (await SettingsManager.isRestricted(message));
            case Status.private:
                return message.fromMe;
            case Status.none:
                return false;
            default:
                return false;
        }
    };

    static checkSudo = async (message: WAWebJS.Message) => {
        const body = message.body;
        const words = body.split(this.spliter);
        const prefix = isTest ? testPrefix : "";
        const sudo = `#${prefix}sudo`;

        if (words[0] !== sudo) return false;

        if (words.length === 2) {
            await this.execSudoCommand(message, words[1]);
            return true;
        } else if (words[1] === "add" && words.length === 3) {
            await SettingsManager.addRestricted(words[2], message);
            return true;
        } else if (words[1] === "remove" && words.length === 3) {
            await SettingsManager.removeRestricted(words[2], message);
            return true;
        }
    };

    static execSudoCommand = async (message: WAWebJS.Message, status: string) => {
        if (!(await SettingsManager.isRestricted(message))) return;
        if (SettingsManager.setBotStatus(status)) {
            Send.text(message, {}, `Bot status set to ${status}`);
            return;
        }
        Send.catch(message, `Error: Invalid status ${status}`);
        return;
    };


    static getAuthor = async (message: WAWebJS.Message) => {
        const chat = await message.getChat();
        if (chat.isGroup) {
            return message.author || "";
        }
        return message.from;
    };
}
