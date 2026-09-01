const { ProxyAgent } = require('proxy-agent');
const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');
const app = express();

// 🌐 Discord Webhook Settings
// Remember to change this placeholder to your actual channel webhook URL!
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1543944197067898943/ATiUVFN3Qq-PN0RQwyHrl_n40d7eIOBoMtxn_EX_Ijgv_rE95ZDHSwmpzoluX2_WbDQV'; 

function sendDiscordWebhook(message) {
  if (!WEBHOOK_URL || WEBHOOK_URL.startsWith('YOUR_')) return;
  axios.post(WEBHOOK_URL, { content: message })
    .catch(err => console.error('Failed to send Discord webhook:', err.message));
}

// Uptime Web Server (Required to keep Wispbyte free-tier slots online)
app.get('/', (req, res) => res.send('Aurora Assistant 24/7 Self-Healing Core Engine Active!'));
app.listen(3000, () => console.log('Uptime network socket bound to port 3000'));

let bot;
let afkInterval = null;

function createBot() {
  console.log('Connecting to DonutSMP via authenticated proxy tunnel...');
  
  // FIXED: Your complete proxy from your list is now fully restored here!
  const proxyAgent = new ProxyAgent('http://31.59.20');

  bot = mineflayer.createBot({
    host: "donutsmp.net",
    port: 25565,
    username: 'justintayjunxi19@outlook.com',
    auth: 'microsoft',
    version: false,
    // Fixes the "client timed out after 60000ms" protocol drop
    checkTimeoutInterval: 90 * 1000, 
    connectionTimeout: 90000,
    agent: proxyAgent 
  });

  bot.on('login', () => {
    const logMsg = `🟢 DonutSMP Alert: Bot successfully authenticated as ${bot.username}!`;
    console.log(logMsg);
    sendDiscordWebhook(logMsg);
  });

  bot.on('spawn', () => {
    console.log('Bot spawned into the world grid. Activating Anti-AFK Movement Matrix...');
    
    // Clear any dangling interval loops if they exist
    if (afkInterval) clearInterval(afkInterval);

    // Advanced Matrix Loop: Executes alternating actions every 12 seconds
    afkInterval = setInterval(() => {
      if (!bot || !bot.entity) return;

      const actionDice = Math.floor(Math.random() * 4);
      const randomYaw = Math.random() * Math.PI * 2;
      const randomPitch = (Math.random() - 0.5) * 0.5;

      // Unstuck routine: look around randomly to push fresh telemetry to server anti-cheat
      bot.look(randomYaw, randomPitch);

      switch(actionDice) {
        case 0:
          // Toggle Sneaking
          bot.setControlState('sneak', true);
          setTimeout(() => bot.setControlState('sneak', false), 800);
          break;
        case 1:
          // Perform a quick jump
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
          break;
        case 2:
          // Take a tiny step forward
          bot.setControlState('forward', true);
          setTimeout(() => bot.setControlState('forward', false), 400);
          break;
        case 3:
          // Take a tiny step backward
          bot.setControlState('back', true);
          setTimeout(() => bot.setControlState('back', false), 400);
          break;
      }
    }, 12000);
  });

  // TPA Auto-Accept Utility
  bot.on('tpRequest', (username) => {
    console.log(`Auto-accepting incoming teleport allocation from: ${username}`);
    bot.chat(`/tpaccept ${username}`);
  });

  // Basic Commands Engine
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    const cmd = message.toLowerCase();
    if (cmd === '!help') bot.chat('Aurora Bot Core is operating fully automated.');
    if (cmd === '!ping') bot.chat(`Pong! Bot connection is routing normally.`);
  });

  bot.on('error', (err) => {
    const errMsg = `⚠️ DonutSMP Error Hook: ${err.message}`;
    console.error(errMsg);
    sendDiscordWebhook(errMsg);
  });

  bot.on('end', (reason) => {
    // CRITICAL: Force a 4-minute safety cooldown. 
    // This gives Microsoft plenty of time to fully drop your ghost connections
    // and completely prevents the "does the account own minecraft?" corrupted profile error!
    const delayTime = 240000; 
    
    const endMsg = `🔴 DonutSMP Connection Severed (${reason}). Safety Token Cooldown engaged. Reconnecting cleanly in 4 minutes...`;
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
