import WAWebJS, { Client, LocalAuth } from "whatsapp-web.js";
import fs from 'fs';
import { join } from "path";
import qrcode from 'qrcode-terminal'

let commands = new Map();
const client: WAWebJS.Client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    }
});

client.on('ready', () => {
    fs.readdirSync(join(__dirname, 'modules')).forEach((file: string) => {
        if (file.endsWith('.ts')) {
            const module = require(join(__dirname, 'modules', file));
            commands.set(module.name, module);
        }
    })
    console.log(`${client.info.wid._serialized} is ready!`);

})

client.on('qr', (qr: string) => {
    console.log('QR code:');
    qrcode.generate(qr, { small: true });
})

client.on('message_create', async (message: WAWebJS.Message) => {
    // console.log(message.from);
    if (message.isStatus) return;
    if (message.body == '') return;
    let firstWord = message.body.split(' ')[0];
    if (!firstWord[0].match(/^[!#$]/)) return;
    firstWord = firstWord.slice(1);
    if (!commands.has(firstWord)) {
        return;
    }
    commands.get(firstWord).process(message, client);
})

client.initialize().catch((err: Error) => {
    console.log(err);
});