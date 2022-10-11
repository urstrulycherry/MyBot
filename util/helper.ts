import WAWebJS from "whatsapp-web.js";

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
}
