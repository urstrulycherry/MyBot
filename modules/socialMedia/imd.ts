/* eslint-disable @typescript-eslint/no-explicit-any */
import WAWebJS from "whatsapp-web.js";
import { Send } from "../../util/reply";
import { instaSave } from "./imd_helper";
const noMedia = "No media found";
const error = "Something went wrong, please try again later";
export const imd = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, url: string) => {
    instaSave(url).then(async (res: any) => {
        if (res.status) {
            res.data.forEach(async (v: any) => {
                Send.url(message, options, v);
            });
        } else {
            Send.catch(message, noMedia);
        }
    }).catch(() => {
        Send.catch(message, error);
    });
};
