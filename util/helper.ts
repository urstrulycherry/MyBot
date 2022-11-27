import WAWebJS, { MessageSendOptions } from "whatsapp-web.js";

const Executer = {
    TagAll: "!",
    TagAdmins: "#",
    TagNonAdmins: "$",
    TagNone: "."
};

export class helper {
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

    static isAdmin = async (message: WAWebJS.Message, client: WAWebJS.Client, author = false) => {
        const chat = await message.getChat();
        if (!chat.isGroup) return false;
        const group: WAWebJS.GroupChat = chat as WAWebJS.GroupChat;
        let user: string | undefined;
        if (!author || message.fromMe) {
            user = client.info.wid._serialized;
        } else {
            user = message.author;
        }
        if (!user) return false;
        const participants = group.participants;
        return participants.find((participant) => participant.id._serialized === user)?.isAdmin;
    };
}
