module.exports = {
    name: "setgame",
    usage: "<game>",
    defaultPermission: 4,
    args: 1,
    execute(Client, msg){
        Client.bot.user.setGame(msg.params.join(" "));
    }
};
