module.exports = {
    name: "queue",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute (Client, msg) {
        let message = "";
        if (!Client.music.queue.has(msg.guild.id)) Client.music.queue.set(msg.guild.id, new Array());
        for (let song in Client.music.queue.get(msg.guild.id)) {
            let playlist = "";
            if (Client.music.queue.get(msg.guild.id)[song].type == "playlist") {
                playlist = " | Playlist " + Client.music.queue.get(msg.guild.id)[song].songs.length + " songs left";
            }
            message += song + ": " + Client.music.queue.get(msg.guild.id)[song].title + playlist + "\n";
        }
        Client.db.getSettings(msg.guild.id, "musicChannel").then((channelId) => {
            message = Client.createEmbed("music", message, "Song queue");
            if (channelId) {
                Client.sendChannel(msg, channelId, message);
            } else {
                Client.send(msg, message);
            }
        });
    }
};
