module.exports = {
    name: "kick",
    usage: "@user|userID [reason]",
    defaultPermission: 2,
    failPermission: "You can't kick people :point_up:",
    args: 1,
    guildOnly: true,
    execute (Client, msg) {
        let userID = Client.extractID(msg, 0);

        msg.guild.fetchMember(userID).then((member) => {
            msg.params.shift();
            let reason = msg.params.join(" ");

            if (member.kickable) {
                member.kick(reason).then((member) =>{
                    Client.send(msg, Client.createEmbed("kick", "<@" + member.id + "> You have been kicked :wave:"));
                    Client.log(msg, member.id, "kick", reason);

                    let kickMessage = "You have been kicked";
                    if (reason) kickMessage = "You are kicked because: " + reason;

                    member.send(Client.createEmbed("kick", kickMessage));
                }).catch((reason) => {
                    Client.send(msg, Client.createEmbed("fail", reason));
                });
            } else {
                Client.send(msg, Client.createEmbed("fail", `My permissions are not high enough to kick <@${member.id}>`));
            }
        }).catch(() => {
            Client.send(msg, Client.createEmbed("fail", "This is not a valid member."));
        });
    }
};
