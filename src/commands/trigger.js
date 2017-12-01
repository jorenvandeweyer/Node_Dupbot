module.exports = {
    name: "trigger",
    description: "!trigger",
    usage: "@user",
    defaultPermission: 1,
    args: 0,
    execute(self, msg){
        let avatarURL = msg.author.avatarURL;

        if(msg.mentions.users.keyArray().length){
            avatarURL = msg.mentions.users.get(msg.mentions.users.firstKey()).avatarURL;
        }
        require('child_process').exec("/root/repos/go/src/github.com/nomad-software/meme/meme -trigger -i " + avatarURL.replace("size=2048", "size=128") + " -cid 2874783bfa9be1e", function(error, stdout, stderr){
            msg.channel.send(stdout);
        });
    }
};
