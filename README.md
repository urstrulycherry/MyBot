# **MyBot - WhatsApp Bot**

![](https://img.shields.io/github/stars/urstrulycherry/MyBot?style=flat-square)&emsp;
![](https://img.shields.io/github/forks/urstrulycherry/MyBot?style=flat-square)&emsp;
![](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Furstrulycherry%2FMyBot)

## Description

This is an automated WhatsApp bot which performs tasks like downloading media from other social media platforms(Twitter, Instagram, and YouTube), generating stickers, downloading manga comics, performing calculations, live cricket scores, job searches, weather updates, and many more.

> <br/>This project is purely written in TypeScript.
> <br/><br/>

<br/>

## Usage

The associated process will be finished when a new message is formed with the message body's first word including the name of the module prefixed with "." or "!" or "#" or "$".

### How to Get Social Media Content

```
#md https://twitter.com/urstrulyMahesh/status/1523898728381227008

By doing this, the media will be downloaded and sent to the appropriate chat. Even better, you can download numerous files from various urls by separating them with spaces or new lines.
```

### Converting image/video to sticker

```
To make a media message into a sticker, use the command "#sticker". Even without quoting the media, you might send a message along with it.
```

<br/>

## Installation and Running

> \
> You must have git, node, and npm installed on your PC in order to do this. (For a better experience, use VSCode as your editor and install the ESLint and Error Lens Extensions.)<br/><br/>

1. Clone the repositery

```
git clone https://github.com/urstrulycherry/MyBot
```

2. Install necessary packages

```
npm install
```

3. Run

```
For deploying use
> npm start

For testing
> npm test
```

<br/>

## Contribution

- Fork the repositery
- Follow Installation and Running
- Add new module in /modules folder
- You should follow ESLint rules before creating a pull request.
- It must have below snippet with proper filename

```ts
import WAWebJS from "whatsapp-web.js"
const process = async (message: WAWebJS.Message, client: WAWebJS.Client) => {
  // Your module code here
}
module.exports = {
  name: "name_of_module",
  process,
}
```

<br/>

## Testing

For testing, use **_npm test_**. All module names will begin with "test\_" while being tested.

> For instance, when testing, you would use **_#test_alive_** instead of _#alive_ to verify whether the bot is still alive. By doing this, conflicts caused by running two processes at once will be eliminated.
