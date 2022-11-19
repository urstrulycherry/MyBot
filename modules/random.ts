import WAWebJS from "whatsapp-web.js";
import { react } from "../util/reply";

const process = async (message: WAWebJS.Message, client: WAWebJS.Client, _options: WAWebJS.MessageSendOptions) => {
    console.log("Random");
    const chat: WAWebJS.Chat = await message.getChat();
    if (!chat.isGroup) return react.error(message);
    const group: WAWebJS.GroupChat = chat as WAWebJS.GroupChat;
    const participants: WAWebJS.GroupParticipant[] = group.participants;

    const random = Math.floor(Math.random() * participants.length);
    const randomParticipant = participants[random];
    const randomParticipantContact = await client.getContactById(randomParticipant.id._serialized);
    message.reply(`Random person @${randomParticipant.id.user}`, undefined, { mentions: [randomParticipantContact] }).then(() => {
        react.success(message);
    }).catch(() => {
        react.error(message);
    });
};

module.exports = {
    name: "random",
    process
};
