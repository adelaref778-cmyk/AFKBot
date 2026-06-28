require("dotenv").config();
const http = require("http");
const { Client, GatewayIntentBits, Events } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const timers = new Map();
const SLEEP_CHANNEL_NAME = "AFK";

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const member = newState.member || oldState.member;
  if (!member || member.user.bot) return;

  if (!oldState.selfDeaf && newState.selfDeaf) {
    const timer = setTimeout(async () => {
      try {
        const freshMember = await member.guild.members.fetch(member.id);
        const current = freshMember.voice;

        if (!current.channelId || !current.selfDeaf) return;

        const sleepChannel = freshMember.guild.channels.cache.find(
          ch =>
            ch.name.toLowerCase() === SLEEP_CHANNEL_NAME.toLowerCase() &&
            ch.isVoiceBased()
        );

        if (!sleepChannel) {
          console.log("ما لقيت روم AFK في السيرفر");
          return;
        }

        await freshMember.voice.setChannel(sleepChannel);
        console.log(`تم نقل ${freshMember.user.tag} إلى ${SLEEP_CHANNEL_NAME}`);
      } catch (err) {
        console.log("فشل النقل:", err.message);
      }

      timers.delete(member.id);
    }, 10 * 60 * 1000);

    timers.set(member.id, timer);
  }

  if (oldState.selfDeaf && !newState.selfDeaf) {
    const timer = timers.get(member.id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(member.id);
    }
  }
});

client.once(Events.ClientReady, () => {
  console.log(`${client.user.tag} is online!`);
});

client.login(process.env.TOKEN);

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
}).listen(process.env.PORT || 3000);