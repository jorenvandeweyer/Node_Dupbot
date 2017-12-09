const {botOwner} = require("../../serverSettings.json");

module.exports = {
    name: "botinfo",
    description: "!botinfo",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
        msg.client.fetchUser(botOwner).then( (user) => {
            let members = 0;
            for(guild of msg.client.guilds){
                members+=guild[1].memberCount;
            }
        	self.send(msg, {
                embed: {
                    color: 0x5a00b1,
                    title: "=-=-=-=-=-=-= Dupbot =-=-=-=-=-=-=",
                    fields: [
                        {
                            name: "Numbers of guilds",
                            value: msg.client.guilds.size
                        }, {
                            name: "Numbers of members",
                            value: members
                        }
                    ],
                    footer: {
                        icon_url: user.avatarURL,
                        text: "Made by " + user.username + "#" + user.discriminator
                    },
                    thumbnail: {
                        url: msg.client.user.avatarURL
                    }
                }
            });
        })

    }
};
