import WAWebJS from "whatsapp-web.js";

const process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
    console.log("Tagall");
    let body: string = "*Everyone!*";
    let chat: WAWebJS.Chat = await message.getChat();
    if (!chat.isGroup) return
    let group: WAWebJS.GroupChat = chat as WAWebJS.GroupChat;
    let participants: WAWebJS.Contact[] = []
    for (let participant of group.participants) {
        participants.push(await client.getContactById(participant.id._serialized))
    }
    message.reply(body, undefined, { mentions: participants }).catch((err: any) => { console.log(err) });
}

module.exports = {
    name: "tagall",
    process
}