module.exports = {
    name: "ping",
    description: "!ping",
    defaultPermission: 1,
    args: 0,
    execute (Client, msg) {
        let message = Client.createEmbed("info", "Pong");
        Client.send(msg, message);
    }
};
