module.exports = {
    name: "stats",
    description: "stats",
    defaultPermission: 2,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        let stats = new Stats(self, msg);
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
                        if(i == 50) break;
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
            if(!channel[1].permissionsFor(this.msg.client.user).has("VIEW_CHANNEL"))continue;
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
            this.self.db.setStats(this.msg.guild.id, id, "MSG_SENT", this.stats[id]);
        }
    }
}
