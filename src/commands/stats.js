module.exports = {
    name: "stats",
    description: "stats",
    defaultPermission: 4,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        let stats = new Stats(self, msg);
        // let channels = msg.guild.channels.filter( (x) => {
        //     if(x.type == "text"){
        //         return true;
        //     }
        //     return false
        // });
        // let channel = [msg.channel.id, msg.channel];
        // for(let channel of channels){
            // channel[1].fetchMessages({after: msg.guild.createdTimestamp, limit: 100}).then((messages) => {
            //     self.send(msg, `${messages.size} messages fetched from ${channel[0]}`);
            //     self.send(msg, `created at ${messages.first().createdAt}`);
            // });
        // }

        // self.send(msg, channels.keyArray().join(", "));
    }
};

function fetchMessages(channel, after, _callback){
    channel.fetchMessages({after: after, limit: 100}).then((messages) => {

    });
}

function fetchStats(channel, _callback){
    let obj = {};
}

class Stats{
    constructor(self, msg){
        this.requests = 0;
        this.stats = {};
        this.started = Date.now();
        this.self = self;
        this.msg = msg;
        this.init();
    }

    init(){
        this.channels = this.msg.guild.channels.filter( (x) => {
            return x.type == "text";
        });
        this.getStats();
    }

    async getStats(_callback){
        await this.self.db.getStats(this.msg.guild.id, "all", async (result) => {
            if(result.length == 0){
                await this.fetchAllMessages();
            }

            this.self.db.getStats(this.msg.guild.id, "all", (result) => {
                if(result){
                    let message = "Members with most sent messages:\n";
                    for(let i = 0; i <result.length; i++){
                        console.log(result[i].id, result[i].value);
                        message += `\n${i+1} - <@${result[i].id.toString()}>: ${result[i].value} messages`;
                    }
                    message = this.self.createEmbed("info", message, "Sent messages");
                    this.self.send(this.msg, message);
                }
            });
        });
    }

    async fetchAllMessages(){
        for(let channel of this.channels){
            await this.fetchAllMessagesChannel(channel[1], this.msg.guild.createdTimestamp)
        }
        this.self.send(this.msg, JSON.stringify(this.stats));
        this.self.send(this.msg, `Done, took ${(Date.now() - this.started) / 1000}seconds to fetch ${this.requests/10}k messages.`);

        this.updateDatabase();
    }

    async fetchAllMessagesChannel(channel, after){
        await channel.fetchMessages({after: after, limit: 100}).then( async (messages) => {
            console.log(`${channel.id}: ${this.requests}`);
            this.requests++;

            messages = messages.sort( (a, b) => {
                return a.createdTimestamp - b.createdTimestamp;
            });

            for(let message of messages){
                let author = message[1].author.id;
                if(!(author in this.stats)){
                    this.stats[author] = 0;
                }
                this.stats[author]++;
            }

            if(messages.size == 100){
                await this.fetchAllMessagesChannel(channel, messages.lastKey());
            }
        });
    }

    updateDatabase(){
        for(let id in this.stats){
            console.log(id);
            this.self.db.setStats(this.msg.guild.id, id, "MSG_SENT", this.stats[id]);
        }
    }
}
