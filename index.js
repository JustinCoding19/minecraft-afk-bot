const { ProxyAgent } = require('proxy-agent');
const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');
const app = express();

// 🌐 Discord Webhook Settings
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1543944197067898943/ATiUVFN3Qq-PN0RQwyHrl_n40d7eIOBoMtxn_EX_Ijgv_rE95ZDHSwmpzoluX2_WbDQV'; 

function sendDiscordWebhook(message) {
  if (!WEBHOOK_URL || WEBHOOK_URL.startsWith('YOUR_')) return;
  axios.post(WEBHOOK_URL, { content: message })
    .catch(err => console.error('Failed to send Discord webhook:', err.message));
}

// Uptime Web Server (Bound to your unique Wispbyte public port)
app.get('/', (req, res) => res.send('Aurora Assistant Multi-Proxy Rotator Core Active!'));
app.listen(10255, () => console.log('Uptime network socket bound to port 10255'));

// 🔑 YOUR PRIVATE PROXY LIST
// The bot will cycle through these automatically if it gets kicked or blocked!
const proxyList = [
  'http://31.59.20',
  'http://31.59.20',
  'http://185.162.229',
  'http://185.162.229',
  'http://185.162.228',
  'http://45.153.22',
  'http://45.153.23',
  'http://45.137.23',
  'http://45.137.22'
];

let currentProxyIndex = 0;
let bot;
let afkInterval = null;

function createBot() {
  const currentProxy = proxyList[currentProxyIndex];
  console.log(`\n==================================================`);
  console.log(`🚀 [Proxy #${currentProxyIndex + 1}/${proxyList.length}] Trying IP: ${currentProxy.split('@')[1]}`);
  console.log(`==================================================`);
  
  const proxyAgent = new ProxyAgent(currentProxy);

  bot = mineflayer.createBot({
    host: "donutsmp.net",
    port: 25565,
    username: 'justintayjunxi19@outlook.com',
    auth: 'microsoft',
    version: false,
    checkTimeoutInterval: 45 * 1000, // Faster timeout check to cycle dead proxies quickly
    connectionTimeout: 45000,
    agent: proxyAgent 
  });

  bot.on('resourcePack', (url, hash) => {
    console.log('Accepting server resource pack...');
    bot.acceptResourcePack();
  });

  bot.on('login', () => {
    const logMsg = `🟢 DonutSMP Core: Bot authenticated via Proxy #${currentProxyIndex + 1}! Name: ${bot.username}`;
    console.log(logMsg);
    sendDiscordWebhook(logMsg);
  });

  bot.on('spawn', () => {
    console.log('🎉 Bot successfully spawned inside the grid! Disabling proxy rotation loops.');
    
    // Auto-Bypass Lobby Queue
    setTimeout(() => {
      if (bot && bot.entity) {
        console.log('Executing entry route command...');
        bot.chat('/server survival'); 
      }
    }, 5000);

    // Advanced Matrix Loop: Executes alternating movements every 12 seconds
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
    bot.chat(`/tpaccept ${username}`);
  });

  bot.on('error', (err) => {
    console.error(`❌ Proxy Error [${err.code || 'TIMEOUT'}]: ${err.message}`);
  });

  bot.on('end', (reason) => {
    console.warn(`🔴 Disconnected from connection route. Reason: ${reason}`);
    
    if (afkInterval) {
      clearInterval(afkInterval);
      afkInterval = null;
    }

    // Move to the next proxy index in the array list
    currentProxyIndex = (currentProxyIndex + 1) % proxyList.length;
    
    // Paced 10-second swap delay so the server logs don't lock your token
    console.log(`⚙️ Swapping proxy configs. Moving to Proxy #${currentProxyIndex + 1} in 10 seconds...`);
    setTimeout(createBot, 10000);
  });
}

createBot();
