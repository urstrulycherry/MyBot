/* eslint-disable */
import got from "got";
import cheerio from "cheerio";
export const instaSave = (url: string) => {
    return new Promise(async (resolve) => {
        try {
            if (!url.match(/(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/) && !url.match(/(https|http):\/\/www.instagram.com\/(p|reel|tv|stories)/gi)) return resolve({ developer: "@Alia Uhuy", status: false, msg: "Link Url not valid" });
            function decodeSnapApp(args: any) {
                let [h, u, n, t, e, r] = args;
                // @ts-ignore
                function decode(d, e, f) {
                    const g = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/".split("");
                    const h = g.slice(0, e);
                    const i = g.slice(0, f);
                    // @ts-ignore
                    let j = d.split("").reverse().reduce((a, b, c) => {
                        if (h.indexOf(b) !== -1) {
                            return a += h.indexOf(b) * (Math.pow(e, c));
                        }
                    }, 0);
                    let k = "";
                    while (j > 0) {
                        k = i[j % f] + k;
                        j = (j - (j % f)) / f;
                    }
                    return k || "0";
                }
                r = "";
                for (let i = 0, len = h.length; i < len; i++) {
                    let s = "";
                    // @ts-ignore
                    while (h[i] !== n[e]) {
                        s += h[i]; i++;
                    }
                    for (let j = 0; j < n.length; j++) {
                        s = s.replace(new RegExp(n[j], "g"), j.toString());
                    }
                    // @ts-ignore
                    r += String.fromCharCode(decode(s, e, 10) - t);
                }
                return decodeURIComponent(encodeURIComponent(r));
            }
            function getEncodedSnapApp(data: any) {
                return data.split("decodeURIComponent(escape(r))}(")[1]
                    .split("))")[0]
                    .split(",")
                    .map((v: string) => v.replace(/"/g, "").trim());
            }
            function getDecodedSnapSave(data: any) {
                return data.split('getElementById("download-section").innerHTML = "')[1]
                    .split('"; document.getElementById("inputData").remove(); ')[0]
                    .replace(/\\(\\)?/g, "");
            }
            function decryptSnapSave(data: any) {
                return getDecodedSnapSave(decodeSnapApp(getEncodedSnapApp(data)));
            }
            const html = await got.post("https://snapsave.app/action.php?lang=id", {
                headers: {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "content-type": "application/x-www-form-urlencoded", "origin": "https://snapsave.app",
                    "referer": "https://snapsave.app/id",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
                },
                form: { url }
            }).text();
            const decode = decryptSnapSave(html);
            const $ = cheerio.load(decode);
            const results: any = new Set();
            if ($("table.table").length || $("article.media > figure").length) {
                // facebook
                return resolve({ developer: "@Alia Uhuy", status: false, msg: "Not support facebook" });
            }
            $("div.download-items__thumb").each((_: any, tod: any) => {
                const thumbnail = $(tod).find("img").attr("src");
                $("div.download-items__btn").each((_: any, ol: any) => {
                    let _url = $(ol).find("a").attr("href");
                    if (!/https?:\/\//.test(_url || "")) _url = `https://snapsave.app${_url}`;
                    results.add(_url);
                });
            });

            if (!results.size) return resolve({ status: false, msg: "Blank data" });
            return resolve({ developer: "@Alia Uhuy", status: true, data: results });
        } catch (e: any) {
            return resolve({ developer: "@Alia Uhuy", status: false, msg: e.message });
        }
    });
};
