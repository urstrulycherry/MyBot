import WAWebJS, { Client, LocalAuth, MessageSendOptions } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { Helper } from "./util/helper";
import { react } from "./util/reply";
import { Modules } from "./util/modules";
import * as dotenv from "dotenv";
import { EVENTS, LINUX, TEST_FLAG, UNSUPPORTED_PLATFORM, WINDOWS } from "./conf";
dotenv.config();

const isTest = process.argv[2] === TEST_FLAG;
const platform = process.platform;

const client: WAWebJS.Client =
    platform === WINDOWS.PLATFORM
        ? new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                executablePath: WINDOWS.GOOGLE_CHROME_PATH
            }
        })
        : new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                executablePath: LINUX.GOOGLE_CHROME_PATH,
                args: LINUX.ARGS
            }
        });


client.on(EVENTS.READY, async () => {
    console.log(`${client.info.wid._serialized} is ready!`);
    Modules.setup();
    Modules.loadModules();
});

client.on(EVENTS.QR, (qr: string) => {
    console.log("QR code:");
    if (platform === WINDOWS.PLATFORM) {
        qrcode.generate(qr, { small: true });
    } else if (platform === LINUX.PLATFORM) {
        qrcode.generate(qr);
    }
});

client.on(EVENTS.MESSAGE_CREATE, async (message: WAWebJS.Message) => {
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

if (platform === WINDOWS.PLATFORM || platform === LINUX.PLATFORM) {
    client.initialize().catch((err: Error) => {
        console.log(err);
    });
} else {
    console.log(UNSUPPORTED_PLATFORM);
}
