module.exports = {
    name: "unsilence",
    usage: "@name|userID",
    defaultPermission: 2,
    failPermission: "You can't unsilence people :point_up:",
    args: 1,
    guildOnly: true,
    execute (Client, msg) {
        Client.extractMember(msg, 0).then((member) => {
            if (member === null) {
                return Client.send(msg, Client.createEmbed("fail", "This is not a valid member"));
            }

            member.setMute(false).then((member) => {
                Client.send(msg, Client.createEmbed("warn", `${member} Unmuted :ok_hand:`));
            }).catch((reason) => {
                Client.send(msg, Client.createEmbed("fail", reason.message));
            });
        });
    }
};
