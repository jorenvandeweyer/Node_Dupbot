module.exports = {
    name: "stats",
    description: "stats",
    defaultPermission: 2,
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
        this.fetchAllMessages(this.msg.guild.createdTimestamp);
    }

    init(){
        this.channels = this.msg.guild.channels.filter( (x) => {
            return x.type == "text";
        });
    }

    fetchAllMessages(after){
        let channel = [this.msg.channel.id, this.msg.channel];
        // for(let channel of this.channels){
            channel[1].fetchMessages({after: after, limit: 100}).then((messages) => {
                console.log(`${this.requests}`);
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
                    this.fetchAllMessages(messages.lastKey());
                } else {
                    this.self.send(this.msg, JSON.stringify(this.stats));
                    this.self.send(this.msg, `Done, took ${(Date.now() - this.started) / 1000}seconds to fetch ${this.requests/10}k messages.`);
                }

            });
        // }
    }
}
