import WAWebJS, { Client, LocalAuth } from "whatsapp-web.js";
import fs from "fs";
import { join } from "path";
import qrcode from "qrcode-terminal";

const commands = new Map();
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
    fs.readdirSync(join(__dirname, "modules")).forEach((file: string) => {
        if (file.endsWith(".ts")) {
            import(join(__dirname, "modules", file)).then((module) => {
                if (isTest) {
                    commands.set(`test_${module.name}`, module);
                } else {
                    commands.set(module.name, module);
                }
                console.log(`Loaded ${module.name}`);
            });
        }
    });

    // create folder media/images media/stickers media/videos media/temp if not exist
    const folders = ["media", "media/images", "media/stickers", "media/videos", "media/temp"];
    folders.forEach((folder) => {
        if (!fs.existsSync(join(__dirname, folder))) {
            fs.mkdirSync(join(__dirname, folder));
        }
    });

    console.log(`${client.info.wid._serialized} is ready!`);
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
    let firstWord = message.body.split(/\s+/g)[0];
    if (!firstWord[0].match(/^[.!#$]/)) return;
    firstWord = firstWord.slice(1);
    if (!commands.has(firstWord)) {
        return;
    }
    commands.get(firstWord).process(message, client);
});

if (platform === "win32" || platform === "linux") {
    client.initialize().catch((err: Error) => {
        console.log(err);
    });
} else {
    console.log("Unsupported platform");
}
