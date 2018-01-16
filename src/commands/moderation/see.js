module.exports = {
    name: "see",
    usage: "@name|userID",
    defaultPermission: 2,
    args: 1,
    guildOnly: true,
    execute (Client, msg) {
        if (msg.params.includes("--remove")) {
            remove(Client, msg);
        } else {
            let userID = Client.extractID(msg, 0);

            Client.db.getModlog(msg.guild.id, userID).then((result) => {
                if (result.length) {
                    let format = formatEntries(result);
                    let embed = new Client.RichEmbed();
                    embed.setTitle("Modlog");
                    embed.setColor("BLUE");
                    embed.setDescription(`All events related to <@${userID}>`);
                    embed.addField("Warnings:", format.warn);
                    embed.addField("Kicks:", format.kick);
                    embed.addField("bans:", format.ban);
                    embed.addField("Unbans:", format.unban);
                    embed.addField("Notes:", format.note);

                    Client.db.getSettings(msg.guild.id, "logchannel").then((channelId) => {
                        if (channelId) {
                            Client.sendChannel(msg, channelId, embed);
                        } else {
                            Client.send(msg, embed);
                        }
                    });
                } else {
                    msg.guild.fetchMember(userID).then((user) => {
                        let embed = Client.createEmbed("succes", `<@${user.id}> has a clean record.`);
                        Client.send(msg, embed);
                    }).catch(() => {
                        Client.send(msg, Client.createEmbed("fail", "This is not a valid member."));
                    });
                }
            });
        }
    }
};

function remove(Client, msg) {
    let index = msg.params.indexOf("--remove") + 1;
    //cross guild removal needs to be fixed.
    Client.db.con.query("DELETE FROM modlog WHERE id=?", [msg.params[index]], (err) => {
        if (err) return Client.sys("error", err);
        Client.db.getSettings(msg.guild.id, "logchannel").then((channelId) => {
            let embed = Client.createEmbed("succes", "Removed log");
            if (channelId) {
                Client.sendChannel(msg, channelId, embed);
            } else {
                Client.send(msg, embed);
            }
        });
    });
}

function formatEntries(rows) {
    let result = {
        warn: "",
        kick: "",
        ban: "",
        unban: "",
        note: ""
    };

    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];

        result[row.type] += `ID:${row.id} - ${dateToString(row.timestamp)} - <@${row.mod}> - ${row.reason}\n`;
    }

    for (let key in result) {
        if (result[key] === "") result[key] = "-";
    }

    return result;
}

function dateToString(date) {
    return new Date(parseInt(date)).toISOString().replace(/[A-z]/g, " ");
}
