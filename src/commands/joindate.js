module.exports = {
    name: "joindate",
    description: "!joindate",
    usage: "<userid>",
    defaultPermission: 1,
    args: 1,
    guildOnly: true,
    execute(self, msg){
        let member = msg.guild.members.get(msg.params[0]);
        let message = self.createEmbed("info", member.user.username + "#" + member.user.discriminator + "'s join date: " + member.joinedAt.toISOString().split("T")[0]);
    	self.send(msg, message);
    }
};
