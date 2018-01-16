module.exports = {
    name: "play",
    usage: "<youtube url, song name>",
    defaultPermission: 1,
    args: 1,
    guildOnly: true,
    execute (Client, msg) {
        Client.db.getSettings(msg.guild.id, "voiceChannel").then((channelId) => {
            let voiceChannelUser = msg.member.voiceChannelID;
            if (voiceChannelUser === undefined) {
                let message = Client.createEmbed("warn", "Go in a voiceChannel first");
                Client.send(msg, message);
            } else if (channelId && voiceChannelUser != channelId) {
                let message = Client.createEmbed("warn", "This server has a dedicated music channel <#" + channelId + "> go there please.");
                Client.send(msg, message);
            } else {
                let queue = Client.music.queue.get(msg.guild.id);
                if (queue && queue.size >= 100) {
                    let message = Client.createEmbed("warn", "Queue is full!");
                    Client.send(msg, message);
                } else {
                    Client.music.addSong(Client, msg);
                }
            }
        });
    }
};
