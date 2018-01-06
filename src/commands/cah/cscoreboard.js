module.exports = {
    name: "cscoreboard",
    description: "!cscoreboard",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        Client.cah.scoreboard(Client, msg);
    }
};
