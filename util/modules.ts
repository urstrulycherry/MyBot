import fs from "fs";
import { join } from "path";
import { Available, Config, testPrefix } from "./global";
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const config: Config = require("../data/config.json");

export class Modules {
    static commands = new Map();

    static loadModules = () => {
        this.commands = new Map();
        fs.readdirSync(join(process.cwd(), "modules")).forEach((file: string) => {
            if (file.endsWith(".ts")) {
                import(join(process.cwd(), "modules", file)).then((module) => {
                    this.commands.set(module.name, module);
                    console.log(`Loaded ${module.name}`);
                });
            }
        });
    };

    static isModuleAvailable = (moduleName: string, fromMe: boolean) => {
        if (!this.commands.has(moduleName)) {
            return false;
        }
        if (!config[moduleName] || !config[moduleName].available) {
            return false;
        } else if (config[moduleName].available === Available.None) {
            return false;
        } else if (config[moduleName].available === Available.Public) {
            return true;
        }
        return fromMe;
    };

    static setup = () => {
        console.log("Setting up...");
        const folders = ["media", "media/images", "media/stickers", "media/videos", "media/temp"];
        folders.forEach((folder) => {
            if (!fs.existsSync(join(process.cwd(), folder))) {
                fs.mkdirSync(join(process.cwd(), folder));
            }
        });
    };

    static updateConfig = (moduleName: string, available: string) => {
        return new Promise((resolve, reject) => {
            if (!this.commands.has(moduleName)) {
                reject(new Error("Module not found"));
            }
            if (!config[moduleName]) {
                reject(new Error("Module not found"));
            } else if (moduleName === "update") {
                reject(new Error("Cannot update update module"));
            } else if (!Object.values(Available).includes(available)) {
                reject(new Error("Invalid value"));
            } else {
                config[moduleName].available = available;
                fs.writeFileSync(join(process.cwd(), "data", "config.json"), JSON.stringify(config, null, 4));
                resolve("Updated");
            }
        });
    };

    static getModuleName = (command: string, isTest: boolean) => {
        if (isTest && command.startsWith(testPrefix)) {
            command = command.slice(testPrefix.length);
        }
        return command;
    };
}
