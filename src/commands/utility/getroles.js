module.exports = {
    name: "getroles",
    description: "!getroles",
    defaultPermission: 1,
    args: 0,
    guildOnly: true,
    execute(Client, msg){
        message = Client.createEmbed("info", msg.member.roles.keyArray().map(x => ("<@&" + x + ">")).join(", "), "Roles");
    	Client.send(msg, message);
    }
};
