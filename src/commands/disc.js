const {botOwner} = require("../../serverSettings.json");

module.exports = {
    name: "disc",
    description: "disc",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
        msg.client.fetchUser(botOwner).then( (user) => {

            for(let guild of msg.client.guilds){
                guild[1].fetchMembers().then((fetchedGuild) => {
                   let members = fetchedGuild.members;

                   console.log("test");
                   members = members.filter((x) => {
                       return user.discriminator === x.user.discriminator && user.username !== x.user.username;
                   });


                   let users = [];
                   for(let member of members){
                       users.push(member[1].user.username);
                   }
                   console.log(users);
                });
            }

        });
    }
};
