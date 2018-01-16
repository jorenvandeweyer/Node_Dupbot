module.exports = {
    name: "unban",
    usage: "userID",
    defaultPermission: 2,
    failPermission: "You can't unban people :point_up:",
    args: 0,
    guildOnly: true,
    execute (Client, msg) {
        msg.guild.fetchBans().then((users) => {
            if (msg.params.length >= 1) {
                if (users.has(msg.params[0])) {
                    msg.guild.unban(msg.params[0]).then((user) => {
                        Client.log(msg, user.id, "unban");
                        user.send(Client.createEmbed("succes", `You have been unbanned from **${msg.guild.name}**`));
                    });
                } else {
                    Client.send(msg, Client.createEmbed("fail", `<@${msg.params[0]}> is not banned`));
                }
            } else {
                let embed = new Client.RichEmbed();
                embed.setTitle(`Banned members (${users.size}):`);
                embed.setColor("RED");
                let body = "";
                for (let user of users) {
                    body += `\n<@${user[0]}>: ${user[0]}`;
                }
                embed.setDescription(body);
                Client.send(msg, embed);
            }
        });
    }
};
