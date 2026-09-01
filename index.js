const { ProxyAgent } = require('proxy-agent');
const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');
const app = express();

// 🌐 Discord Webhook Settings
// Change this placeholder quote string to your actual Discord channel webhook link!
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1543944197067898943/ATiUVFN3Qq-PN0RQwyHrl_n40d7eIOBoMtxn_EX_Ijgv_rE95ZDHSwmpzoluX2_WbDQV'; 

function sendDiscordWebhook(message) {
  if (!WEBHOOK_URL || WEBHOOK_URL.startsWith('YOUR_')) return;
  axios.post(WEBHOOK_URL, { content: message }).catch(() => {});
}

// Uptime Web Server (Bound to your unique Wispbyte public allocation port)
app.get('/', (req, res) => res.send('Aurora Assistant Client-Spoof Core Running Active!'));
app.listen(10255, () => console.log('Uptime network socket bound to port 10255'));

// 🔑 Your Webshare proxy rotation list
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
let hasSpawnedOnce = false;

function createBot() {
  const currentProxy = proxyList[currentProxyIndex];
  
  // Clean string display for log cleanliness
  const displayIP = currentProxy.includes('@') ? currentProxy.split('@')[1] : currentProxy;
  
  console.log(`\n==================================================`);
  console.log(`🤖 [Proxy #${currentProxyIndex + 1}/${proxyList.length}] Routing via Spoofed Engine Route: ${displayIP}`);
  console.log(`==================================================`);
  
  hasSpawnedOnce = false;
  const proxyAgent = new ProxyAgent(currentProxy);

  bot = mineflayer.createBot({
    host: "donutsmp.net",
    port: 25565,
    username: 'justintayjunxi19@outlook.com',
    auth: 'microsoft',
    version: false,
    
    // ⚡ PREMIUM PERFORMANCE SPLAY PROFILES
    physicsEnabled: false,       // Disables physical entity ticker processing (eliminates keep-alive lag kicks)
    viewDistance: 'tiny',        // Tells the server gateway to ignore sending heavy terrain chunk packets
    checkTimeoutInterval: 120000, // Forces the script to hold network handshake sockets open for 2 minutes
    connectionTimeout: 120000,   // Extends authentication response allowances
    agent: proxyAgent 
  });

  // Automatically drop heavy resource pack payloads to prevent packet pipeline choking
  bot.on('resourcePack', () => {
    console.log('Premium Spoof: Bypassing resource pack verification payload...');
    bot.acceptResourcePack();
  });

  bot.on('login', () => {
    const logMsg = `🟢 Successfully Authenticated with Mojang as ${bot.username}`;
    console.log(logMsg);
    sendDiscordWebhook(logMsg);
  });

  bot.on('spawn', () => {
    hasSpawnedOnce = true;
    console.log('🎉 Spawn state registered. Sending instant server migration packet...');
    
    // Direct bypass realm command execution
    setTimeout(() => {
      if (bot && bot.entity) {
        console.log('Transitioning out of central lobby matrix...');
        bot.chat('/server survival');
      }
    }, 4000);
  });

  bot.on('error', (err) => {
    console.error(`❌ Network Exception [${err.code || 'UNKNOWN'}]: ${err.message}`);
  });

  bot.on('end', (reason) => {
    let cooldown = 10000; // Fast 10-second skip if the IP was dropped prior to logging in
    
    if (hasSpawnedOnce || reason === 'socketClosed') {
      // If the bot successfully authenticated but dropped right after, force a session recovery delay
      cooldown = 180000;
      console.warn(`⚠️ Active session closed by host. Engaging 3-minute safety cooldown to protect Microsoft account tokens...`);
    } else {
      console.warn(`🔴 Proxy IP blocked by gateway firewall. Progressing proxy list matrix...`);
    }

    currentProxyIndex = (currentProxyIndex + 1) % proxyList.length;
    console.log(`⚙️ Cycling configurations. Re-initiating stream via Proxy #${currentProxyIndex + 1} in ${cooldown / 1000}s...`);
    setTimeout(createBot, cooldown);
  });
}

createBot();
