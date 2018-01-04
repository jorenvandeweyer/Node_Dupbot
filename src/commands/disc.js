const {botOwner} = require("../../serverSettings.json");

module.exports = {
    name: "disc",
    description: "disc",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
        msg.client.fetchUser(botOwner).then( async (user) => {
            let users = {};
            for(let guild of msg.client.guilds){
                await guild[1].fetchMembers().then((fetchedGuild) => {
                   let members = fetchedGuild.members;

                   for(let member of members){
                       let username = member[1].user.username;
                       if(!(username in users)) users[username] = {value: 0, disc: []};
                       if(!users[username].disc.includes(member[1].user.discriminator)){
                           users[username].value++;
                           users[username].disc.push(member[1].user.discriminator);
                       }
                   }

                });
            }
            let most = Object.keys(users).sort((a, b) => {
                return users[b].value - users[a].value;
            });
            for(let i = 0; i < 20; i++){
                console.log(most[i], users[most[i]]);
            }
        });
    }
};
