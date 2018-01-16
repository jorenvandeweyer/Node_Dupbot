module.exports = {
    name: "note",
    usage: "@user|userID [text]",
    defaultPermission: 2,
    failPermission: "You can't add notes for members :thinking: ",
    args: 2,
    guildOnly: true,
    execute (Client, msg) {
        Client.extractMember(msg, 0).then((member) => {
            if (member === null) {
                return Client.send(msg, Client.createEmbed("fail", "Not a member"));
            }

            msg.params.shift();
            let note = msg.params.join(" ");

            Client.log(msg, member.id, "note", note);


            Client.send(msg, Client.createEmbed("note", `Added note for ${member}`));
        });
    }
};
