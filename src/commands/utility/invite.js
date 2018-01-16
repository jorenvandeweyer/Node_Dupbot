module.exports = {
    name: "invite",
    defaultPermission: 1,
    args: 0,
    execute (Client, msg) {
        msg.author.send(`https://discordapp.com/oauth2/authorize/?permissions=2146958591&scope=bot&client_id=${msg.client.user.id}`);
    }
};
