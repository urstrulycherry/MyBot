import WAWebJS from "whatsapp-web.js";
const process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
    console.log("alive");
    message.reply("Huh and you?").catch((err: any) => {
        return
    }).catch((err: any) => {
        return
    })
}

module.exports = {
    name: "alive",
    process
}