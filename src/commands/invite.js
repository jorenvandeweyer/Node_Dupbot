module.exports = {
    name: "invite",
    description: "!invite",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
        msg.author.send("https://discordapp.com/oauth2/authorize/?permissions=2146958591&scope=bot&client_id=346727503357935616");
    }
};
