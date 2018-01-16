module.exports = {
    name: "joindate",
    usage: "<userid>",
    defaultPermission: 1,
    args: 1,
    guildOnly: true,
    execute (Client, msg) {
        let member = msg.guild.members.get(msg.params[0]);
        if (member) {
            let message = Client.createEmbed("info", member.user.username + "#" + member.user.discriminator + "'s join date: " + member.joinedAt.toISOString().split("T")[0]);
            Client.send(msg, message);
        } else {
            let message = Client.createEmbed("fail", "Not a member");
            Client.send(msg, message);
        }
    }
};
