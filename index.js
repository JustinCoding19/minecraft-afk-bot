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
let isTransferring = false; // 🛡️ Tracks if the bot is intentionally shifting server nodes
let movementTimeout = null; // Holds movement timeout to clear properly on disconnect

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
  isTransferring = false; // Reset transfer tracking on initial connect
  if (movementTimeout) clearTimeout(movementTimeout);

  bot = mineflayer.createBot({
    host: "donutsmp.net",
    port: 25565, 
    username: 'justintayjunxi19@outlook.com', 
    auth: 'microsoft', 
    version: false, // ✅ Auto-detects server version
    checkTimeoutInterval: 120 * 1000, // 🛡️ Bypasses high traffic lag drops
    brand: 'vanilla', // 🎭 Simulates a vanilla client to pass firewalls
    profilesFolder: './tokens' // 🛡️ Saves authentication token data locally on Wispbyte
  });

  bot.on('message', (message) => {
    const msg = message.toString().toLowerCase();

    // 🔐 Handle internal server authentication commands quietly
    if (msg.includes('/register')) {
      bot.chat('/register Bot@12345 Bot@12345');
    } else if (msg.includes('/login')) {
      bot.chat('/login Bot@12345');
    }
  });

  function randomMovement() {
    if (!bot || !bot.entity) return;
    const directions = ['forward', 'back', 'left', 'right'];
    const dir = directions[directions.length * Math.random() | 0];

    bot.setControlState(dir, true);
    movementTimeout = setTimeout(() => {
      if (bot && bot.entity) bot.setControlState(dir, false);
      movementTimeout = setTimeout(randomMovement, 2000);
    }, 3000);
  }

  // 🚀 Forces transition out of proxy entry lobby instantly
  bot.once('spawn', () => {
    setTimeout(() => {
      if (!bot) return;
      console.log('Bot logged in! Moving past entry proxy node...');
      
      // Tell our script to expect a connection drop during the switch phase
      isTransferring = true; 
      bot.chat('/play survival'); 
      
      setTimeout(() => {
        if (bot && bot.entity) {
          bot.chat('AFK bot online!');
          sendDiscordAlert("⚠️ **DonutSMP Alert:** Bot successfully connected and transferred to the survival world node!");
          randomMovement();
        }
      }, 5000); 
    }, 5000);
  });

  bot.on('end', () => {
    if (movementTimeout) clearTimeout(movementTimeout);
    console.log('Bot disconnected from socket.');
    
    // If it's a proxy transfer drop, suppress the alerting spam since it's normal behavior
    if (isTransferring) {
      console.log('Normal proxy transition link switch detected. Quietly reconnecting...');
      setTimeout(createBot, 3000); 
    } else {
      sendDiscordAlert("⚠️ **DonutSMP Alert:** Bot disconnected from DonutSMP. Attempting to reconnect in 5 seconds...");
      setTimeout(createBot, 5000);
    }
  });

  bot.on('error', err => {
    console.log('Bot error encountered:', err.message || err);
    // Ignore alerting ECONNRESET if we just initiated a `/play survival` node transfer
    if (isTransferring && (err.message.includes('ECONNRESET') || err.code === 'ECONNRESET')) {
      console.log('Caught expected ECONNRESET during proxy handover.');
      return;
    }
    sendDiscordAlert(`⚠️ **DonutSMP Alert:** An error occurred: ${err.message || err}`);
  });

  bot.on('kicked', reason => {
    console.log('Bot was kicked:', reason);
    const kickText = typeof reason === 'object' ? JSON.stringify(reason) : reason;
    
    // If anti-cheat flags the proxy switch jump as a kick, intercept it to auto-reconnect silently
    if (isTransferring) {
      console.log('Handled proxy kick exception during survival routing.');
      return;
    }
    sendDiscordAlert(`⚠️ **DonutSMP Alert:** The bot was kicked from DonutSMP! Reason: \`${kickText.slice(0, 100)}\``);
  });
}

createBot();
