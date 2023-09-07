import WAWebJS from "whatsapp-web.js";
import { Send } from "../../util/reply";
import ytdl from "ytdl-core";
import axios from "axios";

export const yt = async (message: WAWebJS.Message, options: WAWebJS.MessageSendOptions, url: string) => {
    const error = "Something went wrong, please try again later";
    try {
        console.log("Youtube download");
        const info = await ytdl.getInfo(url);
        const duration = Number(info.videoDetails.lengthSeconds);
        const formats = ytdl.filterFormats(info.formats, "videoandaudio");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const video = formats.filter((f) => f.hasVideo).sort((a, b) => b.width! - a.width!)[0];
        const videoUrl = video.url;
        if (duration < 80) {
            return Send.url(message, options, videoUrl, info.videoDetails.title);
        }
        const response = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(videoUrl)}`);
        const shortUrl = response.data.shorturl;
        const msg = `*Title:* ${info.videoDetails.title}

*Duration:* ${info.videoDetails.lengthSeconds} seconds

*Download Link:* ${shortUrl}`;
        await Send.formattedText(message, options, msg);
    } catch (_) {
        Send.catch(message, error);
    }
};
