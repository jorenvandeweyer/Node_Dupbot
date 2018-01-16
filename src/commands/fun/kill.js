module.exports = {
    name: "kill",
    description: "!kill [@user]",
    usage: "[@user]",
    defaultPermission: 0,
    args: 0,
    guildOnly: true,
    execute (Client, msg) {
        if (msg.params.length === 0) {
            if (msg.permissionLevel >= 2) {
                let message = Client.createEmbed("info", "Admins are immortal");
                return Client.send(msg, message);
            }
            msg.member.kick().then(() => {
                let message = Client.createEmbed("kick", msg.auther.username + " died...");
                Client.send(msg, message);
            }).catch(() => {
                let message = Client.createEmbed("fail", "I can't kick you :|");
                Client.send(msg, message);
            });
        } else if (msg.params.length >= 1) {
            if (msg.permissionLevel < 2) {
                let message = Client.createEmbed("info", "You can't kill people :point_up:");
                return Client.send(msg, message);
            }
            if (Client.extractID(msg)) {
                msg.member.guild.fetchMember(Client.extractID(msg)).then((member) => {
                    member.kick().then(() => {
                        let message = Client.createEmbed("kick", member.user.username + " died...");
                        Client.send(msg, message);
                    });
                });
            }
        }
    }
};
