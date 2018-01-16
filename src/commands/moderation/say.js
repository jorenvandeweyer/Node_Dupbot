module.exports = {
    name: "say",
    usage: "<text>",
    defaultPermission: 2,
    failPermission: "You can't say things",
    args: 1,
    execute (Client, msg) {
        let message = Client.createEmbed("info", msg.params.join(" "));
        Client.send(msg, message);
    }
};
