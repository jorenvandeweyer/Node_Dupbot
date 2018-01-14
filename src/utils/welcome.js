module.exports = (Client, member) => {
    Client.db.getSettings(member.guild.id, "welcome").then((welcomeMessage) => {
        if(!welcomeMessage) return;
        Client.db.getSettings(member.guild.id, "welcomeChannel").then((welcomeChannel) => {
            if(!welcomeChannel) return;

            let embed = new Client.RichEmbed();
            embed.setColor("RED");
            embed.setTitle("Welcome");
            embed.setDescription(`<@${member.id}> joined, say Hi!`);
            embed.addField("What now?", welcomeMessage);
            embed.setThumbnail(member.user.avatarURL);

            if(!member.guild.channels.get(welcomeChannel).permissionsFor(Client.bot.user).has("SEND_MESSAGES")) return;

            member.guild.channels.get(welcomeChannel).send(embed).then((message) => {
                message.react("👋");
            });
        });
    })
};
