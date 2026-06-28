require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const timers = new Map();

const SLEEP_CHANNEL_ID = "1520422082490531980";

client.on("voiceStateUpdate", (oldState, newState) => {
  const member = newState.member;

  if (!member || member.user.bot) return;

  if (!oldState.selfDeaf && newState.selfDeaf) {
    const timer = setTimeout(async () => {
      const current = member.voice;

      if (current && current.selfDeaf) {
        try {
          await member.voice.setChannel(SLEEP_CHANNEL_ID);
        } catch (err) {
          console.log(err);
        }
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

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

client.login(process.env.TOKEN);
