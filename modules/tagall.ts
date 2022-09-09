import WAWebJS from "whatsapp-web.js";

const process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
    console.log("Tagall");
    const body = "*Everyone!*";
    const chat: WAWebJS.Chat = await message.getChat();
    if (!chat.isGroup) return;
    const group: WAWebJS.GroupChat = chat as WAWebJS.GroupChat;
    const participants: WAWebJS.Contact[] = [];
    for (const participant of group.participants) {
        participants.push(await client.getContactById(participant.id._serialized));
    }
    message.reply(body, undefined, { mentions: participants }).catch((err: Error) => {
        console.log(err);
    });
};

module.exports = {
    name: "tagall",
    process
};
