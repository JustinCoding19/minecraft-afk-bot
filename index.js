const { ProxyAgent } = require('proxy-agent');
const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');
const app = express();

// 🌐 Webhook Configuration
// Put your actual Discord webhook URL inside the quotes below
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1543944197067898943/ATiUVFN3Qq-PN0RQwyHrl_n40d7eIOBoMtxn_EX_Ijgv_rE95ZDHSwmpzoluX2_WbDQV'; 

function sendDiscordWebhook(message) {
  if (!WEBHOOK_URL || WEBHOOK_URL.startsWith('YOUR_')) return;
  axios.post(WEBHOOK_URL, { content: message })
    .catch(err => console.error('Failed to send Discord webhook:', err.message));
}

// Uptime Web Server (Keeps Wispbyte container online)
app.get('/', (req, res) => {
  res.send('Aurora Assistant is active via Proxy!');
});
app.listen(3000, () => {
  console.log('Uptime webserver running on port 3000');
});

let bot;

function createBot() {
  console.log('Connecting to DonutSMP via authenticated proxy...');
  
  // Using the clean proxy from your list
  const proxyAgent = new ProxyAgent('http://31.59.20');

  bot = mineflayer.createBot({
    host: "donutsmp.net",
    port: 25565,
    username: 'justintayjunxi19@outlook.com',
    auth: 'microsoft',
    version: false,
    checkTimeoutInterval: 60 * 1000,
    agent: proxyAgent // Forces Mojang auth to route through the proxy
  });

  bot.on('login', () => {
    const logMsg = `⚠️ DonutSMP Alert: Bot has successfully authenticated with Mojang as ${bot.username}!`;
    console.log(logMsg);
    sendDiscordWebhook(logMsg);
  });

  bot.on('spawn', () => {
    console.log('Bot spawned successfully on DonutSMP.');
  });

  // Handle Teleport Requests automatically
  bot.on('tpRequest', (username) => {
    console.log(`Accepting teleport request from ${username}`);
    bot.chat(`/tpaccept ${username}`);
  });

  // Chat Commands handler (!help, !ping, greetings)
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    const lowerMessage = message.toLowerCase();

    if (lowerMessage === '!help') {
      bot.chat('Available commands: !ping, !help, hello');
    } else if (lowerMessage === '!ping') {
      bot.chat(`Pong, ${username}!`);
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('how are you')) {
      bot.chat(`Hey ${username}! I am doing great running on my proxy agent.`);
    }
  });

  // Whisper Response handler
  bot.on('whisper', (username, message) => {
    bot.whisper(username, 'I received your whisper! I am currently AFK.');
  });

  bot.on('error', (err) => {
    const errMsg = `⚠️ DonutSMP Alert: Connection error: ${err.message}`;
    console.error(errMsg);
    sendDiscordWebhook(errMsg);
  });

  bot.on('end', (reason) => {
    const endMsg = `⚠️ DonutSMP Alert: Disconnected: ${reason}. Retrying in 60 seconds...`;
    console.warn(endMsg);
    sendDiscordWebhook(endMsg);
    
    setTimeout(createBot, 60000); // 60s cooldown loop to keep proxy unblocked
  });
}

createBot();
