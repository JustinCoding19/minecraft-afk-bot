const { ProxyAgent } = require('proxy-agent');
const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');
const app = express();

// 🌐 Discord Webhook Settings
// Paste your real channel webhook URL inside the quotes below if you want alerts!
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1543944197067898943/ATiUVFN3Qq-PN0RQwyHrl_n40d7eIOBoMtxn_EX_Ijgv_rE95ZDHSwmpzoluX2_WbDQV'; 

function sendDiscordWebhook(message) {
  if (!WEBHOOK_URL || WEBHOOK_URL.startsWith('YOUR_')) return;
  axios.post(WEBHOOK_URL, { content: message })
    .catch(err => console.error('Failed to send Discord webhook:', err.message));
}

// Uptime Web Server (Bound to your unique Wispbyte public allocation port)
app.get('/', (req, res) => res.send('Aurora Assistant 24/7 Ultra-Stable Core Active!'));
app.listen(10255, () => console.log('Uptime network socket bound to port 10255'));

let bot;
let afkInterval = null;

function createBot() {
  console.log('Connecting to DonutSMP via authenticated proxy tunnel...');
  
  // Handshake proxy configuration profile
  const proxyAgent = new ProxyAgent('http://31.59.20');

  bot = mineflayer.createBot({
    host: "donutsmp.net",
    port: 25565,
    username: 'justintayjunxi19@outlook.com',
    auth: 'microsoft',
    version: false,
    checkTimeoutInterval: 90 * 1000, 
    connectionTimeout: 90000,
    agent: proxyAgent 
  });

  // Automatically accept DonutSMP's resource pack so it stops dropping the connection socket
  bot.on('resourcePack', (url, hash) => {
    console.log('Accepting server resource pack...');
    bot.acceptResourcePack();
  });

  bot.on('login', () => {
    const logMsg = `🟢 DonutSMP Alert: Bot successfully authenticated as ${bot.username}!`;
    console.log(logMsg);
    sendDiscordWebhook(logMsg);
  });

  bot.on('spawn', () => {
    console.log('Bot spawned in lobby. Initiating server entry sequence...');
    
    // Auto-Bypass: Drops straight past the lobby after 5 seconds to clear lobby queue bugs
    setTimeout(() => {
      if (bot && bot.entity) {
        console.log('Executing entry route command...');
        bot.chat('/server survival'); // Changes directory out of the buggy layout lobby loop
      }
    }, 5000);

    // Advanced Matrix Loop: Executes alternating movements every 12 seconds to cheat anti-AFK radars
    if (afkInterval) clearInterval(afkInterval);
    afkInterval = setInterval(() => {
      if (!bot || !bot.entity) return;

      const actionDice = Math.floor(Math.random() * 4);
      const randomYaw = Math.random() * Math.PI * 2;
      const randomPitch = (Math.random() - 0.5) * 0.5;

      bot.look(randomYaw, randomPitch);

      switch(actionDice) {
        case 0:
          bot.setControlState('sneak', true);
          setTimeout(() => bot.setControlState('sneak', false), 800);
          break;
        case 1:
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
          break;
        case 2:
          bot.setControlState('forward', true);
          setTimeout(() => bot.setControlState('forward', false), 400);
          break;
        case 3:
          bot.setControlState('back', true);
          setTimeout(() => bot.setControlState('back', false), 400);
          break;
      }
    }, 12000);
  });

  bot.on('tpRequest', (username) => {
    console.log(`Auto-accepting teleport allocation from: ${username}`);
    bot.chat(`/tpaccept ${username}`);
  });

  bot.on('error', (err) => {
    const errMsg = `⚠️ DonutSMP Error Hook: ${err.message}`;
    console.error(errMsg);
    sendDiscordWebhook(errMsg);
  });

  bot.on('end', (reason) => {
    // 2-minute safety delay balances fast logging with token protection
    const delayTime = 120000; 
    
    const endMsg = `🔴 DonutSMP Connection Severed (${reason}). Reconnecting in 2 minutes...`;
    console.warn(endMsg);
    sendDiscordWebhook(endMsg);

    if (afkInterval) {
      clearInterval(afkInterval);
      afkInterval = null;
    }

    setTimeout(createBot, delayTime);
  });
}

createBot();
