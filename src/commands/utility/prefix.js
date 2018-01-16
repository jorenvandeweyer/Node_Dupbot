module.exports = {
    name: "prefix",
    description: "!ping",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    async execute (Client, msg) {
        let prefix = await Client.db.getSettings(msg.guild.id, "prefix");
        if (prefix == "") prefix = Client.prefix;
        let message = Client.createEmbed("info", "The prefix is `" + prefix + "`");
        Client.send(msg, message);
    }
};
