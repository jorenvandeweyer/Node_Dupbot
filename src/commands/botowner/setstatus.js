module.exports = {
    name: "setstatus",
    usage: "<status>",
    defaultPermission: 4,
    args: 1,
    execute(Client, msg){
        Client.bot.user.setActivity(msg.params.join(" ")).catch((e) => {console.log(e)});
    }
};
