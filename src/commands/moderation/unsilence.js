module.exports = {
    name: "unsilence",
    usage: "@name|userID",
    defaultPermission: 2,
    failPermission: "You can't unsilence people :point_up:",
    args: 1,
    guildOnly: true,
    execute (Client, msg) {
        let userID = Client.extractID(msg, 0);
        msg.guild.members.get(userID).setMute(false).then((member) => {
            Client.send(msg, Client.createEmbed("warn", `<@${member.id}> Unmuted :ok_hand:`));
        }).catch(() => {
            Client.send(msg, Client.createEmbed("fail", "This is not a valid member."));
        });
    }
};
