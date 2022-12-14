import WAWebJS from "whatsapp-web.js";
import { react, send } from "../util/reply";

const process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
    console.log("Tagall");
    const body = "*Everyone!*";
    const chat: WAWebJS.Chat = await message.getChat();
    if (!chat.isGroup) return send.catch(message);
    const group: WAWebJS.GroupChat = chat as WAWebJS.GroupChat;
    const participants: WAWebJS.Contact[] = [];
    for (const participant of group.participants) {
        participants.push(await client.getContactById(participant.id._serialized));
    }
    message.reply(body, undefined, { mentions: participants })
        .then(() => {
            react.success(message);
        })
        .catch((err: Error) => {
            react.error(message);
            console.log(err);
        });
};

module.exports = {
    name: "tagall",
    process
};
