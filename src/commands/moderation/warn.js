module.exports = {
    name: "warn",
    usage: "@user|userID [reason]",
    defaultPermission: 2,
    failPermission: "You can't warn people :point_up:",
    args: 1,
    guildOnly: true,
    execute (Client, msg) {
        Client.extractMember(msg, 0).then((member) => {
            if (member === null) {
                return Client.send(msg, Client.createEmbed("fail", "Not a member"));
            }

            msg.params.shift();
            let reason = msg.params.join(" ");

            Client.log(msg, member.id, "warn", reason);

            Client.db.getModlog(msg.guild.id, member.id).then((rows) => {
                Client.db.getSettings(msg.guild.id, "warntime").then((value) => {
                    let active = filterActiveWarnings(rows, value);

                    let warnMessage = `You have been warned on **${msg.guild.name}**\n\nYou have ${active}/3 active warnings.`;
                    if (reason) warnMessage += "\nReason: " + reason;

                    member.send(Client.createEmbed("warning", warnMessage));

                    if (active >= 3) {
                        let spoofedMessage = msg;
                        spoofedMessage.params = [member.id, "3 active warnings"] ;
                        spoofedMessage.author = msg.client.user;
                        Client.commands.get("kick").execute(Client, spoofedMessage);
                    }
                });
            });
        });
    }
};

function filterActiveWarnings(rows, warntime) {
    if (warntime) warntime = parseInt(warntime);

    let today = Date.now();
    let active = 0;

    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        if (row.type === "warn") {
            let date = parseInt(row.timestamp);
            if (today - date < warntime * 60 * 60 * 1000) active++;
        }
    }

    return active;
}
