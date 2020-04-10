'use strict';

const { Client } = require('discord.js');
const OsuEvent = require("../OsuEvent");
const client = new Client();
const prefix = '.';
client.login('');

client.on('message', async message => {
  let args = message.content.slice(prefix.length).trim().split(/ +/g);
  if(message.content.startsWith(`${prefix}osuevent`)) {
    if(!args[1].match(/^https?:\/\/osu.ppy.sh\/beatmapsets\/[0-9]*/)) {
      return message.channel.send('The beatmap URL provided is not valid');
    }

    const event = new OsuEvent(
      client,
      'osuApiKey',
      ['NF', 'HT'] //Banned mods
    );

    const osuEvent = await event.start(args[1]).catch(e => {
      return e.toString()
    });

    if(typeof osuEvent === 'string') {
      return message.channel.send(osuEvent);
    }

    const eventMessage = await message.channel.send('Join the event with ➕');
    eventMessage.react('➕');

    const collector = eventMessage.createReactionCollector((reaction, user) => user.id !== client.user.id, { time: 5000 }); //Time in MS
    collector.on('collect', reaction => {
      if(reaction.emoji.name === '➕') {
        const user = reaction.users.cache.last();
        event.addPlayer(user, user.username).catch(_ => {}); //Use the osu name is deprecated, use the osuID
      }
    });

    collector.on('end', async (collector, reason) => {
      if(reason.toString() === 'time') {
        const results = await event.getResults();
        eventMessage.edit(`Scores for osu event:\n${results.map(result => `${result.note}, accuracy: ${result.accuracy}, player: ${result.username}`).join('\n')}`);
      }
    });
  }
});
