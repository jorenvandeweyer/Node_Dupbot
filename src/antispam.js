class Antispam {
    constructor(){
        this.collection = [];
        this.ignore = [];
        this.keys = [];
    }

    start(){
        this.event = setInterval(() => {
            while(this.keys.length > 0 && new Date().getTime() - this.collection[0].timestamp > 30*1000 ){
                this.collection.shift();
                this.keys.shift();
            }

            if(this.keys.length == 0){
                this.stop();
            }
        }, 5000);
    }

    stop(){
        if(this.event){
            clearInterval(this.event);
            this.event = null;
        }
    }

    check(Client, msg, _callback){
        if(this.keys.filter(x => x === msg.author.id + "," + msg.command).length > 6){
            this.ignore.push(msg.author.id);
        } else {
            this.keys.push(msg.author.id + "," + msg.command);
            this.collection.push({
                timestamp: new Date().getTime(),
                author: msg.author.id,
                content: msg.content,
                command: msg.command
            });
            _callback();
        }
        this.start();
    }

}

let antispam = new Antispam();

function c(Client, msg, _callback){
    antispam.check(Client, msg, _callback);
}

module.exports = {
    check: c
};
