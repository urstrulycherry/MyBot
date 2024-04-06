import WAWebJS from "whatsapp-web.js";
import { React, Send } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client) => {
    console.log("Tagall");
    const body = "*Everyone!*";
    const chat: WAWebJS.Chat = await message.getChat();
    if (!chat.isGroup) return Send.catch(message);
    const group: WAWebJS.GroupChat = chat as WAWebJS.GroupChat;
    const participants: string[] = [];
    for (const participant of group.participants) {
        participants.push(participant.id._serialized);
    }
    chat.sendMessage(body, { mentions: participants })
        .then(() => {
            React.success(message);
        })
        .catch(() => {
            React.error(message);
        });
};

module.exports = {
    name: "tagall",
    process
};
