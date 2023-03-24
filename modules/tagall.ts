import WAWebJS from "whatsapp-web.js";
import { React, Send } from "../util/reply";

const process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
    console.log("Tagall");
    const body = "*Everyone!*";
    const chat: WAWebJS.Chat = await message.getChat();
    if (!chat.isGroup) return Send.catch(message);
    const group: WAWebJS.GroupChat = chat as WAWebJS.GroupChat;
    const participants: WAWebJS.Contact[] = [];
    for (const participant of group.participants) {
        participants.push(await client.getContactById(participant.id._serialized));
    }
    message.reply(body, undefined, { mentions: participants })
        .then(() => {
            React.success(message);
        })
        .catch((err: Error) => {
            React.error(message);
            console.log(err);
        });
};

module.exports = {
    name: "tagall",
    process
};
