const http = require('http');
// ✅ Fixes Port Binding Loops by creating a basic web listener for the cloud environment
http.createServer((req, res) => res.end('Minecraft AFK Bot is Online')).listen(process.env.PORT || 10000);

const mineflayer = require('mineflayer');

// 🌐 Your active Discord Webhook URL embedded safely below
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1543944197067898943/ATiUVFN3Qq-PN0RQwyHrl_n40d7eIOBoMtxn_EX_Ijgv_rE95ZDHSwmpzoluX2_WbDQV";

function sendDiscordAlert(message) {
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
let startTime = Date.now(); // ⏱ Tracks the exact millisecond the bot script turned on

function getFormattedSessionTime() {
  const diff = Date.now() - startTime;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) return `${minutes} minute(s)`;
  return `${hours} hour(s) and ${minutes} minute(s)`;
}

// ⏰ Automatically triggers every 1 hour (3600000 milliseconds)
setInterval(() => {
  if (bot && bot.username) {
    const sessionTime = getFormattedSessionTime();
    sendDiscordAlert(`⏱️ **Hourly Status Update:**\n• **Current Session Uptime:** ${sessionTime}\n\n*The bot is still online and actively tracking shards on DonutSMP!*`);
  }
}, 3600000);

function createBot() {
  bot = mineflayer.createBot({
    host: "donutsmp.net",
    port: 25565, 
    username: 'justintayjunxi19@outlook.com', 
    auth: 'microsoft', 
    version: false // ✅ Fixes packet overflow crash by auto-detecting server version
  });

  bot.on('message', (message) => {
    const msg = message.toString().toLowerCase();

    if (msg.includes('/register')) {
      bot.chat('/register Bot@12345 Bot@12345');
    } else if (msg.includes('/login')) {
      bot.chat('/login Bot@12345');
    }

    if (
      msg.includes('teleport to you') ||
      msg.includes('teleport to them')
    ) {
      console.log('Teleport request detected! Accepting...');
      bot.chat('/tpaccept');
    }
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    const lower = message.toLowerCase();

    if (lower.startsWith('!')) {
      const args = lower.slice(1).split(' ');
      const command = args.shift();

      switch (command) {
        case 'help':
          bot.chat(`Hi ${username}, I respond to hello, how are you, and commands like !help, !ping.`);
          break;
        case 'sunilgaming':
          bot.chat(`Hey ${username}, sunilgaming created me!`);
          break;
        case 'ping':
          bot.chat(`Pong, ${username}!`);
          break;
        default:
          bot.chat(`Unknown command: ${command}`);
      }
    } else {
      if (lower.includes('hello')) bot.chat(`Hi ${username}!`);
      else if (lower.includes('how are you')) bot.chat(`I'm just a bot, but thanks for asking!`);
    }
  });

  bot.on('whisper', (username, message) => {
    if (username === bot.username) return;
    console.log(`[Whisper] <${username}>: ${message}`);
    bot.whisper(username, `Hello ${username}, I got your message!`);
  });

  function randomMovement() {
    const directions = ['forward', 'back', 'left', 'right'];
    const dir = directions[Math.floor(Math.random() * directions.length)];

    bot.setControlState(dir, true);
    setTimeout(() => {
      bot.setControlState(dir, false);
      setTimeout(randomMovement, 2000);
    }, 3000);
  }

  // 🚀 Forces transition out of proxy entry lobby instantly to stop 30-second timeout drop errors
  bot.once('spawn', () => {
    setTimeout(() => {
      console.log('Bot logged in! Moving past entry proxy node...');
      
      // Types command to jump from the entry proxy to the active survival server
      bot.chat('/play survival'); 
      
      setTimeout(() => {
        bot.chat('AFK bot online!');
        sendDiscordAlert("⚠️ **DonutSMP Alert:** Bot successfully connected and transferred to the survival world node!");
        randomMovement();
      }, 2000); // Wait 2 seconds for the server swap to complete before cycling movements
    }, 1500);
  });

  bot.on('end', () => {
    console.log('Bot disconnected. Reconnecting in 5 seconds...');
    sendDiscordAlert("⚠️ **DonutSMP Alert:** Bot disconnected from DonutSMP. Attempting to reconnect in 5 seconds...");
    setTimeout(createBot, 5000);
  });

  bot.on('error', err => {
    console.log('Bot error:', err);
    sendDiscordAlert(`⚠️ **DonutSMP Alert:** An error occurred: ${err.message || err}`);
  });

  bot.on('kicked', reason => {
    console.log('Bot was kicked:', reason);
    sendDiscordAlert(`⚠️ **DonutSMP Alert:** The bot was kicked from DonutSMP! Reason: ${reason}`);
  });
}

createBot();
