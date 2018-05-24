class Antispam {
    constructor() {
        this.collection = [];
        this.ignore = new Map();
        this.keys = [];
        this.event = null;
    }

    start() {
        this.event = setInterval(() => {
            while (this.keys.length > 0 && new Date().getTime() - this.collection[0].timestamp > 30*1000 ) {
                this.collection.shift();
                this.keys.shift();
            }

            if (this.keys.length == 0) {
                this.stop();
            }
        }, 5000);
    }

    stop() {
        if (this.event) {
            clearInterval(this.event);
            this.event = null;
        }
    }

    check (Client, msg) {
        if (this.ignore.has(msg.author.id)) {
            let time = this.ignore.get(msg.author.id);
            if (time + 1000*60*10 > Date.now()) {
                return true;
            }
            this.ignore.delete(msg.author.id);
        }

        if (this.keys.filter(x => x === msg.author.id + "," + msg.command).length > 5) {
            this.ignore.set(msg.author.id, Date.now());
            msg.author.send(Client.createEmbed("ban", "The bot will ignore you for 10 minutes because you were flooding it.")).catch((err) => {
                Client.Logger.error(`Shard[${Client.shard.id}]: ${err}`);
            });
        } else {
            this.keys.push(msg.author.id + "," + msg.command);
            this.collection.push({
                timestamp: new Date().getTime(),
                author: msg.author.id,
                content: msg.content,
                command: msg.command
            });
        }

        if (this.event === null) {
            this.start();
        }
        return false;
    }

}

let antispam = new Antispam();

function c(Client, msg) {
    return antispam.check(Client, msg);
}

module.exports = {
    check: c
};
