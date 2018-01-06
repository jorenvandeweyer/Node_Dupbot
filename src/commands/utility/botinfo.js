const {botOwner} = require("../../../serverSettings.json");

module.exports = {
    name: "botinfo",
    description: "!botinfo",
    defaultPermission: 1,
    args: 0,
    execute(Client, msg){
        Client.db.getBotStats("messages", (messages) => {
            msg.client.fetchUser(botOwner).then( (user) => {
                let members = 0;
                for(let guild of msg.client.guilds){
                    members+=guild[1].memberCount;
                }

                let embed = new Client.Discord.RichEmbed();
                embed.setTitle("=-=-=-=-=-=-= Dupbot =-=-=-=-=-=-=");
                embed.setColor("RED");
                embed.setFooter("Made by " + user.username + "#" + user.discriminator, user.avatarURL);
                embed.setThumbnail(msg.client.user.avatarURL);
                embed.addField("Guilds", msg.client.guilds.size);
                embed.addField("Members", members);
                embed.addField("Messages seen", messages);
                Client.send(msg, embed);
            });
        });
    }
};
