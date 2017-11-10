const CAH = require("cah_game");
const fs = require("fs");

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

function send(msg, message, _callback){
    msg.channel.send(message).then((data) => {
		if(typeof _callback === "function"){
			_callback(message);
		}
	});
}

function broadcastCahMessages(msg, array){
	for (let i = 0; i < array.length; i++){
		let data = array[i];

		let message;
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
				//msg.channel.members.get(data.id_private[j]).send(data.description_private[j].replace(/_/g, "\\_")).then((newmsg) => {addReactions(newmsg, data)});
				msg.channel.members.get(data.id_private[j]).send(data.description_private[j].replace(/_/g, "\\_"));
			}
		}
	}
}

// in progress
// function addReactions(msg, data){
// 	switch (data.cards) {
// 		case 10:
// 			msg.react("🔟");
// 		case 9:
// 			msg.react("9⃣");
// 		case 8:
// 			msg.react("8⃣");
// 		case 7:
// 			msg.react("7⃣");
// 		case 6:
// 			msg.react("6⃣");
// 		case 5:
// 			msg.react("5⃣");
// 		case 4:
// 			msg.react("4⃣");
// 		case 3:
// 			msg.react("3⃣");
// 		case 2:
// 			msg.react("2⃣");
// 		case 1:
// 			msg.react("1⃣");
// 			break;
// 		default:
//
// 	}
// 	const collector = msg.createReactionCollector(
// 	 (reaction, user) => reaction.emoji.name == "1⃣" || reaction.emoji.name == "2⃣" || reaction.emoji.name == "3⃣" || reaction.emoji.name == "4⃣" || reaction.emoji.name == "5⃣" || reaction.emoji.name == "6⃣" || reaction.emoji.name == "7⃣" || reaction.emoji.name == "8⃣" || reaction.emoji.name == "9⃣" || reaction.emoji.name == "🔟",
// 	 { time: 60 * 60 * 1000}
// 	);
//
// 	collector.on('collect', r => {
// 		send(msg, r.emoji.name);
// 		collector.stop();
// 	});
// }


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
            let cards;
            if(args.includes("-cards")){
                let index = args.indexOf("-cards");
                cards = args[index + 1];
				if(cards > 10){
					cards = 10;
				}
            } else {
                cards = 5;
            }
            let rounds;
            if(args.includes("-rounds")){
                let index = args.indexOf("-rounds");
                rounds = args[index+1];
            } else {
                rounds = 5;
            }

			let guildid = msg.guild.id;
			if(this.stats[guildid] == undefined){
				this.stats[guildid] = {};
			}

            this.holder[id] = new CAH(msg.author.id, this.stats[msg.guild.id], cards, rounds);

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

			for(let i = 0; i < data.length; i++){
				let message = data[i];

				if(data.status == "data"){
					switch (data.subj) {
						case "point":
							let points = data.data;
							let guildid = msg.guild.id;
							//delete?
							if(this.stats[guildid] == undefined){
								this.stats[guildid] = {};
							}
							if(this.stats[guildid][data.winner] == undefined){
								this.stats[guildid][data.winner] = {points: 0};
							}
							this.stats[guildid][data.winner].points++;

							this.saveStats();
							break;
						default:

					}
				}
			}
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

const game = new gameHandler();
