module.exports = async (Client, member) => {
    const content = await Client.db.getSettings(member.guild.id, "welcome");
    const channel = await Client.db.getSettings(member.guild.id, "welcomeChannel");

    if (!channel || !content) return;

    if (!member.guild.channels.get(channel).permissionsFor(Client.bot.user).has("SEND_MESSAGES")) return;

    const embed = new Client.RichEmbed();
    embed.setColor("RED");
    embed.setTitle("Welcome");
    embed.setDescription(`<@${member.id}> joined, say Hi!`);
    embed.addField("What now?", content);
    embed.setThumbnail(member.user.avatarURL);

    const message = await member.guild.channels.get(channel).send(embed);

    if (message) {
        message.react("👋");
    }
};
