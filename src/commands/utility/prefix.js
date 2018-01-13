module.exports = {
    name: "prefix",
    description: "!ping",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        Client.db.getSettings(msg.guild.id, "prefix").then((pref) =>  {
            let prefix = pref;
            if(prefix == "") prefix = Client.prefix;
            message = Client.createEmbed("info", "The prefix is `" + prefix + "`");
            Client.send(msg, message);
        });
    }
};
