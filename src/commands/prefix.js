module.exports = {
    name: "prefix",
    description: "!ping",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        self.db.getSettings(msg.guild.id, "prefix", (pref) =>  {
            let prefix = pref;
            if(prefix == "") prefix = self.serverManager().prefix;
            message = self.createEmbed("info", "The prefix is `" + prefix + "`");
            self.send(msg, message);
        });
    }
};
