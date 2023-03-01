import WAWebJS, { Client, LocalAuth, MessageSendOptions } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { Helper } from "./util/helper";
import { react } from "./util/reply";
import { Modules } from "./util/modules";
import * as dotenv from "dotenv";
dotenv.config();

const isTest = process.argv[2] === "test";
const platform = process.platform;

const client: WAWebJS.Client =
    platform === "win32"
        ? new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                executablePath:
                    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
            }
        })
        : new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                executablePath: "/usr/bin/google-chrome-stable",
                args: ["--no-sandbox"]
            }
        });


client.on("ready", async () => {
    console.log(`${client.info.wid._serialized} is ready!`);
    Modules.setup();
    Modules.loadModules();
});

client.on("qr", (qr: string) => {
    console.log("QR code:");
    if (platform === "win32") {
        qrcode.generate(qr, { small: true });
    } else {
        qrcode.generate(qr);
    }
});

client.on("message_create", async (message: WAWebJS.Message) => {
    if (message.isStatus) return;
    if (message.body === "" || !message.body) return;
    const firstWord = Helper.getCommandName(message.body, isTest);
    if (!firstWord) return;
    if (!Modules.isModuleAvailable(firstWord, message.fromMe)) {
        return;
    }
    await react.proccessing(message);
    const chat = await message.getChat();
    let options: MessageSendOptions = {};
    if (chat.isGroup) {
        options = await Helper.processOptions(message, client, chat as WAWebJS.GroupChat);
    }
    Modules.commands.get(firstWord).process(message, client, options);
});

if (platform === "win32" || platform === "linux") {
    client.initialize().catch((err: Error) => {
        console.log(err);
    });
} else {
    console.log("Unsupported platform");
}
