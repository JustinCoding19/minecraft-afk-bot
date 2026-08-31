const { ProxyAgent } = require('proxy-agent');
const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');
const app = express();

// Webhook Configuration
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1543944197067898943/ATiUVFN3Qq-PN0RQwyHrl_n40d7eIOBoMtxn_EX_Ijgv_rE95ZDHSwmpzoluX2_WbDQV'; // Replace with your actual Discord webhook URL

function sendDiscordWebhook(message) {
  if (!WEBHOOK_URL || WEBHOOK_URL.startsWith('YOUR_')) return;
  axios.post(WEBHOOK_URL, { content: message })
    .catch(err => console.error('Failed to send Discord webhook:', err.message));
}

// Uptime Web Server (Keep Wispbyte container alive)
app.get('/', (req, res) => {
  res.send('Mineflayer Bot is running smoothly via Proxy!');
});
app.listen(3000, () => {
  console.log('Uptime web server listening on port 3000');
});

let bot;

function createBot() {
  console.log('Initializing Mineflayer bot with proxy routing...');
  
  // Using the first authenticated proxy from your list
  const proxyAgent = new ProxyAgent('http://31.59.20');

  bot = mineflayer.createBot({
    host: "donutsmp.net",
    port: 25565,
    username: 'justintayjunxi19@outlook.com',
    auth: 'microsoft',
    version: false, 
    checkTimeoutInterval: 60 * 1000,
    agent: proxyAgent // Routes Mojang authentication securely through the proxy
  });

  bot.on('login', () => {
    const logMsg = `⚠️ DonutSMP Alert: Bot has successfully logged in as ${bot.username}!`;
    console.log(logMsg);
    sendDiscordWebhook(logMsg);
  });

  bot.on('spawn', () => {
    console.log('Bot spawned into the world.');
  });

  bot.on('error', (err) => {
    const errMsg = `⚠️ DonutSMP Alert: An error occurred: ${err.message}`;
    console.error(errMsg);
    sendDiscordWebhook(errMsg);
  });

  bot.on('end', (reason) => {
    const endMsg = `⚠️ DonutSMP Alert: Bot disconnected. Reason: ${reason}. Reconnecting in 60 seconds...`;
    console.warn(endMsg);
    sendDiscordWebhook(endMsg);

    // Safeguard reconnect interval to protect your proxy IP
    setTimeout(() => {
      createBot();
    }, 60000);
  });
}

createBot();
