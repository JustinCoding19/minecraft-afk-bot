const mineflayer = require('mineflayer');
const { Client, GatewayIntentBits } = require('discord.js');

// 🌐 Configuration Settings
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1543944197067898943/ATiUVFN3Qq-PN0RQwyHrl_n40d7eIOBoMtxn_EX_Ijgv_rE95ZDHSwmpzoluX2_WbDQV";
const DISCORD_BOT_TOKEN = "MTU0Mzg3MDU5NzkzMzU2ODA5MQ.G0ohvk.xQmyi7VnIOsJkOFkJYPHZCn7GMDDcllKePCvJ0"; // 🔴 Paste your actual Discord Bot Token here
const ALLOWED_DISCORD_USER_ID = "1274246931484377185"; // 🔴 Paste your personal Discord User ID here (so only YOU can turn it off)

// Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

function sendDiscordWebhookAlert(message) {
  const data = JSON.stringify({ content: message });
  const url = new URL(DISCORD_WEBHOOK_URL);
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };
  const req = require('https').request(options);
  req.on('error', (e) => console.error('Webhook error:', e));
  req.write(data);
  req.end();
}

let bot;
let startTime = Date.now();
let isTransferring = false;
let movementTimeout = null;

function getFormattedSessionTime() {
  const diff = Date.now() - startTime;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes} minute(s)`;
  return `${hours} hour(s) and ${minutes} minute(s)`;
}

// ⏰ Hourly Status Update Loop
setInterval(() => {
  if (bot && bot.username) {
    const sessionTime = getFormattedSessionTime();
    sendDiscordWebhookAlert(`⏱️ **Hourly Status Update:**\n• **Current Session Uptime:** ${sessionTime}\n\n*The bot is still online and actively tracking shards on DonutSMP!*`);
  }
}, 3600000);

function createBot() {
  isTransferring = false;
  if (movementTimeout) clearTimeout(movementTimeout);

  bot = mineflayer.createBot({
    host: "donutsmp.net",
    port: 25565, 
    username: 'justintayjunxi19@outlook.com', 
    auth: 'microsoft', 
    version: false,
    checkTimeoutInterval: 120 * 1000,
    brand: 'vanilla',
    // 🛡️ Forces Microsoft authentication token data to store permanently inside a folder on Wispbyte
    profilesFolder: './tokens' 
  });

  bot.on('message', (message) => {
    const msg = message.toString().toLowerCase();
    if (msg.includes('/register')) {
      bot.chat('/register Bot@12345 Bot@12345');
    } else if (msg.includes('/login')) {
      bot.chat('/login Bot@12345');
    }
  });

  function randomMovement() {
    if (!bot || !bot.entity) return;
    const directions = ['forward', 'back', 'left', 'right'];
    const dir = directions[Math.floor(Math.random() * directions.length)];
    bot.setControlState(dir, true);
    movementTimeout = setTimeout(() => {
      if (bot && bot.entity) bot.setControlState(dir, false);
      movementTimeout = setTimeout(randomMovement, 2000);
    }, 3000);
  }

  bot.once('spawn', () => {
    setTimeout(() => {
      if (!bot) return;
      console.log('Bot logged in and spawned! Moving past entry proxy node...');
      isTransferring = true; 
      bot.chat('/play survival'); 
      
      setTimeout(() => {
        if (bot && bot.entity) {
          bot.chat('AFK bot online!');
          sendDiscordWebhookAlert("⚠️ **DonutSMP Alert:** Bot successfully connected and transferred to the survival world node!");
          randomMovement();
        }
      }, 5000);
    }, 5000);
  });

  bot.on('end', () => {
    if (movementTimeout) clearTimeout(movementTimeout);
    console.log('Bot disconnected from socket.');
    if (isTransferring) {
      console.log('Normal proxy transition link switch detected. Quietly reconnecting...');
      setTimeout(createBot, 3000); 
    } else {
      sendDiscordWebhookAlert("⚠️ **DonutSMP Alert:** Bot disconnected from DonutSMP. Attempting to reconnect in 5 seconds...");
      setTimeout(createBot, 5000);
    }
  });

  bot.on('error', err => {
    console.log('Bot error encountered:', err.message || err);
    if (isTransferring && (err.message.includes('ECONNRESET') || err.code === 'ECONNRESET')) return;
    sendDiscordWebhookAlert(`⚠️ **DonutSMP Alert:** An error occurred: ${err.message || err}`);
  });

  bot.on('kicked', reason => {
    console.log('Bot was kicked:', reason);
    if (isTransferring) return;
    const kickText = typeof reason === 'object' ? JSON.stringify(reason) : reason;
    sendDiscordWebhookAlert(`⚠️ **DonutSMP Alert:** The bot was kicked from DonutSMP! Reason: \`${kickText.slice(0, 100)}\``);
  });
}

// 🔐 Discord commands listener
client.on('messageCreate', async (message) => {
  if (message.author.bot || message.author.id !== ALLOWED_DISCORD_USER_ID) return;
  const msg = message.content.toLowerCase().trim();
  
  if (msg === '!stop' || msg === '!kill') {
    console.log('🛑 Remote shutdown command received from Discord!');
    sendDiscordWebhookAlert("🛑 **DonutSMP Alert:** Remote shutdown command executed via Discord. Turning off entirely.");
    if (bot) bot.quit();
    client.destroy();
    process.exit(0);
  }
});

// Boot up
client.login(DISCORD_BOT_TOKEN).then(() => {
  console.log('🤖 Discord remote listener connected successfully.');
  createBot();
});
