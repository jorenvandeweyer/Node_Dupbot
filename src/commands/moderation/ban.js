module.exports = {
    name: "ban",
    usage: "@user|userID [reason]",
    defaultPermission: 2,
    failPermission: "You can't ban people :point_up:",
    args: 2,
    guildOnly: true,
    execute (Client, msg) {
        Client.extractMember(msg, 0).then((member) => {
            if (member === null) {
                return Client.send(msg, Client.createEmbed("fail", "This is not a valid member."));
            }
            if (!member.bannable) {
                return Client.send(msg, Client.createEmbed("fail", "Missing Permissions"));
            }

            msg.params.shift();
            let reason = msg.params.join(" ");

            member.ban({
                days: 7,
                reason: reason
            }).then((user) => {
                Client.log(msg, user.id, "ban", reason);
                Client.send(msg, Client.createEmbed("ban", `${user} You have been banned :hammer:`));
                user.send(Client.createEmbed("ban", `You have been banned from **${msg.guild.name}**.\nReason: ${reason}`));
            }).catch((reason) => {
                Client.send(msg, Client.createEmbed("fail", reason.message));
            });
        });
    }
};
