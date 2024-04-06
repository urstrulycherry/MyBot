import WAWebJS from "whatsapp-web.js";
import { React } from "../util/reply";

const process = async (message: WAWebJS.Message, _client: WAWebJS.Client, _options: WAWebJS.MessageSendOptions) => {
    console.log("Random");
    const chat: WAWebJS.Chat = await message.getChat();
    if (!chat.isGroup) return React.error(message);
    const group: WAWebJS.GroupChat = chat as WAWebJS.GroupChat;
    const participants: WAWebJS.GroupParticipant[] = group.participants;

    const random = Math.floor(Math.random() * participants.length);
    const randomParticipant = participants[random];
    chat.sendMessage(`Random person @${randomParticipant.id.user}`, { mentions: [randomParticipant.id._serialized] }).then(() => {
        React.success(message);
    }).catch(() => {
        React.error(message);
    });
};

module.exports = {
    name: "random",
    process
};
