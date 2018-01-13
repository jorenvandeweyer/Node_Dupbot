module.exports = {
    name: "silence",
    usage: "@name|userID",
    defaultPermission: 2,
    args: 1,
    guildOnly: true,
    execute(Client, msg){
        let userID = Client.extractID(msg, 0);
        msg.guild.members.get(userID).setMute(true).then((member) => {
            Client.send(msg, Client.createEmbed("warn", `<@${member.id}> Muted :point_up_2:`));
        }).catch((reason) => {
            Client.send(msg, Client.createEmbed("fail", "This is not a valid member."));
        });
    }
};
