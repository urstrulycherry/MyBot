# **MyBot - WhatsApp Bot**

![](https://img.shields.io/github/stars/urstrulycherry/MyBot?style=social)&emsp;
![](https://img.shields.io/github/forks/urstrulycherry/MyBot?style=flat-square)&emsp;
[![](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Furstrulycherry%2FMyBot)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Furstrulycherry%2FMyBot)

<br>

# Installation and Running

## Table of Contents

### [1. Windows](#windows)

### [2. Linux - Ubuntu](#linux---ubuntu)

### [3. Linux - Without GUI (server image)](#linux---without-gui-server-image)

---

## Windows

1. Download and install latest version of [Node.js](https://nodejs.org/en/download/current/).
2. Download and install latest version of [Git](https://git-scm.com/downloads).
3. Clone the repository in your desired location.

   ```bash
    mkdir MyBot && cd MyBot
    git clone https://github.com/urstrulycherry/MyBot.git .
   ```

4. Install necessary packages.

   ```bash
   npm install
   ```

5. Run.

   > Open `conf.ts` file and update `GOOGLE_CHROME_PATH` (2nd line) to your chrome.exe path.

   ```bash
   npm start
   ```

<br/>

## Linux - Ubuntu

1. Install Node.js and Git.

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash - && sudo apt-get install -y nodejs
   sudo apt install git
   ```

2. Clone the repository in your desired location.

   ```bash
    mkdir MyBot && cd MyBot
    git clone https://github.com/urstrulycherry/MyBot.git .
   ```

3. Install necessary packages.

   ```bash
   npm install
   ```

4. Run.

   > Open `conf.ts` file and update `GOOGLE_CHROME_PATH` (7th line) to the google-chrome-stable path.

   ```bash
   npm start
   ```

<br/>

## Linux - Without GUI (server image)

1. Install Node.js and Git.

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash - && sudo apt-get install -y nodejs
   sudo apt install git
   ```

2. Install necessary packages for Linux-Ubuntu Server.

   ```bash
   sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libu2f-udev libvulkan1 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
   ```

3. Download and install latest version of Google Chrome.

   ```bash
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    sudo dpkg -i google-chrome-stable_current_amd64.deb
   ```

4. Clone the repository in your desired location.

   ```bash
    mkdir MyBot && cd MyBot
    git clone https://github.com/urstrulycherry/MyBot.git .
   ```

5. Install necessary packages.

   ```bash
    npm install
   ```

6. Run.

   > Open `conf.ts` file and update `GOOGLE_CHROME_PATH` (7th line) to the google-chrome-stable path.

   ```bash
    npm start
   ```

7. To keep the bot running even after closing the terminal, tmux can be used.

   ```bash
    sudo apt install tmux
   ```

   ```
   tmux new -s MyBot
   npm start

   ```

   > To detach from the session, press `Ctrl + B` and then `D`.

   > To reattach to the session, run `tmux a -t MyBot`.
