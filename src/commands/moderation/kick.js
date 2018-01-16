module.exports = {
    name: "kick",
    usage: "@user|userID [reason]",
    defaultPermission: 2,
    failPermission: "You can't kick people :point_up:",
    args: 1,
    guildOnly: true,
    execute (Client, msg) {
        Client.extractMember(msg, 0).then((member) => {
            if (member === null) {
                return Client.send(msg, Client.createEmbed("fail", "This is not a valid member"));
            }
            if (!member.kickable) {
                return Client.send(msg, Client.createEmbed("fail", "Missing Permissions"));
            }

            msg.params.shift();
            let reason = msg.params.join(" ");

            member.kick(reason).then((member) =>{
                Client.log(msg, member.id, "kick", reason);
                Client.send(msg, Client.createEmbed("kick", `${member} You have been kicked :wave:`));

                let kickMessage = "You have been kicked";
                if (reason) kickMessage = "You are kicked because: " + reason;

                member.send(Client.createEmbed("kick", kickMessage));
            }).catch((reason) => {
                Client.send(msg, Client.createEmbed("fail", reason.message));
            });
        });
    }
};
