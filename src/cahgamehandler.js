var CAH = require("../node_modules/cah_node/cah");
var fs = require("fs");

function createEmbed(colorName, info, title, fields, footer){
	switch(colorName){
		case "info":
			color = 3447003;
			break;

		case "ban":
			color = 16007746;
			break;

		case "kick":
			color = 16028993;
			break;

		case "warn":
			color = 15908236;
			break;

		case "unban":
			color = 4193355;
			break;

		case "succes":
			color = 4193355;
			break;

		case "fail":
			color = 15908236;
			break;

		case "purple":
			color = 0x5a00b1;
			break;

		default:
			color = 3447003;
			break;
	}

	return {
		embed:{
			color: color,
			description: info,
			title: title,
			fields: fields,
			footer: footer
		}
	};
}

function send(msg, message){
    msg.channel.send(message);
}

function broadcastCahMessages(msg, array){
	for (let i = 0; i < array.length; i++){
		let data = array[i];

		var message;
		if(data.description){
			message = data.description;
		}

		if(data.id != undefined && message.includes("%player")){
			message = message.replace("%player", "<@" + data.id + ">");
		}

		message = createEmbed("purple", message.replace(/_/g, "\\_"));
		send(msg, message);

		if(data.private != undefined){
			for(let j = 0; j < data.id_private.length; j++){
				msg.channel.members.get(data.id_private[j]).send(data.description_private[j].replace(/_/g, "\\_"));
			}
		}
	}
}

class gameHandler{
    constructor(){
        this.holder = {};
        this.getStats();
    }

    getStats(){
        try {
            this.stats = JSON.parse(fs.readFileSync('./data/cahstats.json', 'utf8'));
        } catch(e) {
            this.stats = {};
        }
    }

    saveStats(_callback){
        fs.writeFile(__dirname + "/../data/cahstats.json", JSON.stringify(this.stats), "utf8", function(err){
            (typeof _callback === 'function') ? _callback(err) : null;
        });
    }

    start(msg){
        let id = msg.channel.id;
        if(this.holder[id] == undefined){
            let args = msg.params.slice(0);
            if(args.includes("-cards")){
                let index = args.indexOf("-cards");
                var cards = args[index + 1];
            } else {
                var cards = 5;
            }
            if(args.includes("-rounds")){
                let index = args.indexOf("-rounds");
                var rounds = args[index+1];
            } else {
                var rounds = 5;
            }

            this.holder[id] = new CAH(msg.author.id, cards, rounds);

            let message = createEmbed("purple", "CAH Game started, type !cjoin to join!");
            send(msg, message);
        } else if(msg.author.id == this.holder[id].owner){
            if(game.started){
                let message = createEmbed("purple", "CAH Game is already started!");
                send(msg, message);
            } else {
                let data = this.holder[id].start();
                broadcastCahMessages(msg, data);
            }
        } else {
            let message = createEmbed("purple", "You can't start CAH, wait for <@" + this.holder[id].owner +"> to start the game!");
            send(msg, message);
        }
    }

    join(msg){
        let id = msg.channel.id;
        if(this.holder[id] == undefined){
            let message = createEmbed("purple", "No CAH Game playing, type !cstart to start a game!");
            send(msg, message);
        } else {
            let data = this.holder[id].join(msg.author.id);
            broadcastCahMessages(msg, data);
            //WHEN GAME IS ALREADY PLAYING PRIVATE MESSAGE HAS TO BE SEND!!!!!!
        }
    }

    leave(msg){
        let id = msg.channel.id;
        if(this.holder[id] == undefined){
            let message = createEmbed("purple", "No CAH Game playing.");
            send(msg, message);
        } else {
            let data = this.holder[id].leave(msg.author.id);

            for(let i = 0; i <data.length; i++){
                if(data[i].status == "finished") delete this.holder[id];
            }

            broadcastCahMessages(msg, data);
        }
    }

    choose(msg){
        let id = msg.channel.id;
        if(this.holder[id] == undefined){
            let message = createEmbed("purple", "No CAH Game playing, type !cstart to start a game!");
            send(msg, message);
        } else {
            let data = this.holder[id].choose(msg.author.id, msg.params);

            for(let i = 0; i <data.length; i++){
                if(data[i].status == "finished") delete this.holder[id];
            }

            broadcastCahMessages(msg, data);
        }
    }

    reset(msg){
        let id = msg.channel.id;
        delete this.holder[id];
        broadcastCahMessages(msg, [{
            description: "CAH was resetted for this channel, type !cstart to start a new game!"
        }])
    }
}

exports.start = function(msg){
    game.start(msg);
}

exports.join = function(msg){
    game.join(msg);
}

exports.leave = function(msg){
    game.leave(msg);
}

exports.choose = function(msg){
    game.choose(msg);
}

exports.reset = function(msg){
    game.reset(msg);
}

var game = new gameHandler();
