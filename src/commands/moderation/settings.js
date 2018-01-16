module.exports = {
    name: "settings",
    defaultPermission: 3,
    args: 0,
    guildOnly: true,
    execute (Client, msg) {
        Client.db.getSettings(msg.guild.id, "allSettings").then((settings) => {
            let message = "```";
            for (let i = 0; i < settings.length; i++) {
                message += "\n" + settings[i].setting + ": " + settings[i].value;
            }
            message += "```";

            message = Client.createEmbed("info", message, "Settings for this server");
            Client.send(msg, message);
        });
    }
};
