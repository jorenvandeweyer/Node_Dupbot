module.exports = {
    name: "silence",
    usage: "@name|userID",
    defaultPermission: 2,
    args: 1,
    guildOnly: true,
    execute (Client, msg) {
        Client.extractMember(msg, 0).then((member) => {
            if (member === null) {
                Client.send(msg, Client.createEmbed("fail", "This is not a valid member."));
            }

            member.setMute(true).then((member) => {
                Client.send(msg, Client.createEmbed("warn", `${member} Muted :point_up_2:`));
            }).catch((reason) => {
                Client.send(msg, Client.createEmbed("fail", reason.message));
            });
        });
    }
};
