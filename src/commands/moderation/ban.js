module.exports = {
    name: "ban",
    usage: "@user|userID [reason]",
    defaultPermission: 2,
    failPermission: "You can't ban people :point_up:",
    args: 2,
    guildOnly: true,
    execute (Client, msg) {
        if (Client.extractID(msg, 0)) {
            let targetID = Client.extractID(msg, 0);

            msg.params.shift();
            let reason = msg.params.join(" ");

            msg.guild.fetchMember(targetID).then((member) => {
                if (member.bannable) {
                    member.ban({
                        days: 7,
                        reason: reason
                    }).then((user) => {
                        Client.log(msg, user.id, "ban", reason);
                        Client.send(msg, Client.createEmbed("ban", "<@"+ user.id + "> You have been banned :hammer:"));
                        user.send(Client.createEmbed("ban", `You have been banned from **${msg.guild.name}**.\nReason: ${reason}`));
                    }).catch((reason) => {
                        Client.send(msg, Client.createEmbed("fail", reason));
                    });
                } else {
                    Client.send(msg, Client.createEmbed("fail", `My permissions are not high enought to ban <@${member.id}>`));
                }
            }).catch(() => {
                Client.send(msg, Client.createEmbed("fail", "This is not a valid member."));
            });
        }
    }
};
