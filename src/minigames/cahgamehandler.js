const CAH = require("cah_game");
const fs = require("fs");

function broadcastCahMessages(self, msg, array){
	for (let i = 0; i < array.length; i++){
		let data = array[i];
		if(data.description){
			let message = data.description.replace(/_/g, "\\_");

			if(data.id != undefined && message.includes("%player")){
				message = message.replace("%player", "<@" + data.id + ">");
			}

			if(data.id != undefined && message.includes("%points")){
				self.db.getStats_cah(msg.guild.id, data.id, (row) => {

					let points = 1;
					if(row){
						points+= row.points;
					}
					message = message.replace("%points", points);
					message = self.createEmbed("purple", message);
					self.send(msg, message);
				});
			} else {
				message = self.createEmbed("purple", message);
				self.send(msg, message);
			}

		}

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
    }

    start(self, msg){
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
			let packs;
			if(args.includes("-packs")){
				let index = args.indexOf("-packs");
				packs = args[index+1].split(",");
			} else {
				packs = ["Base"];
			}

			let guildid = msg.guild.id;

            this.holder[id] = new CAH(msg.author.id, cards, rounds, packs);

            let message = self.createEmbed("purple", "CAH Game started, type !cjoin to join!");
            self.send(msg, message);
        } else if(msg.author.id == this.holder[id].owner){
            if(game.started){
                let message = self.createEmbed("purple", "CAH Game is already started!");
                self.send(msg, message);
            } else {
                let data = this.holder[id].start();
                broadcastCahMessages(self, msg, data);
            }
        } else {
            let message = self.createEmbed("purple", "You can't start CAH, wait for <@" + this.holder[id].owner +"> to start the game!");
            self.send(msg, message);
        }
    }

    join(self, msg){
        let id = msg.channel.id;
        if(this.holder[id] == undefined){
            let message = self.createEmbed("purple", "No CAH Game playing, type !cstart to start a game!");
            self.send(msg, message);
        } else {
            let data = this.holder[id].join(msg.author.id);
            broadcastCahMessages(self, msg, data);
            //WHEN GAME IS ALREADY PLAYING PRIVATE MESSAGE HAS TO BE SEND!!!!!!
        }
    }

    leave(self, msg){
        let id = msg.channel.id;
        if(this.holder[id] == undefined){
            let message = self.createEmbed("purple", "No CAH Game playing.");
            self.send(msg, message);
        } else {
            let data = this.holder[id].leave(msg.author.id);

            for(let i = 0; i <data.length; i++){
                if(data[i].status == "finished") delete this.holder[id];
            }

            broadcastCahMessages(self, msg, data);
        }
    }

    choose(self, msg){
        let id = msg.channel.id;
        if(this.holder[id] == undefined){
            let message = self.createEmbed("purple", "No CAH Game playing, type !cstart to start a game!");
            self.send(msg, message);
        } else {
            let data = this.holder[id].choose(msg.author.id, msg.params);

            for(let i = 0; i <data.length; i++){
                if(data[i].status == "finished") delete this.holder[id];
            }


			for(let i = 0; i < data.length; i++){

				if(data[i].status == "data"){
					switch (data[i].subj) {
						case "point":
							let guildid = msg.guild.id;
							let playerid = data[i].winner[0];
							self.db.setStats_cah(guildid, playerid, 1);
							break;
						default:

					}
				}
			}

			broadcastCahMessages(self, msg, data);

        }
    }

    reset(self, msg){
        let id = msg.channel.id;
        delete this.holder[id];
        broadcastCahMessages(self, msg, [{
            description: "CAH was resetted for this channel, type !cstart to start a new game!"
        }])
    }

	skip(self, msg){
		let id = msg.channel.id;
		if(this.holder[id] == undefined){
            let message = self.createEmbed("purple", "No CAH Game playing, type !cstart to start a game!");
            self.send(msg, message);
        } else {
			let data = this.holder[id].skip();
			for(let i = 0; i <data.length; i++){
				if(data[i].status == "finished") delete this.holder[id];
			}
			broadcastCahMessages(self, msg, data);
		}
	}

	kick(self, msg){
		let id = msg.channel.id;
		let userids = msg.mentions.users.keyArray();
		if(this.holder[id] == undefined){
			let message = self.createEmbed("purple", "No CAH Game playing.");
			self.send(msg, message);
		} else {
			while(userids.length){
				let userid = userids.shift();
				console.log(userid);
				let data = this.holder[id].kick(userid);

				for(let i = 0; i < data.length; i++){
					if(data[i].status == "finished") delete this.holder[id];
				}

				broadcastCahMessages(self, msg, data);
			}
		}
	}

	scoreboard(self, msg){
		let guildid = msg.guild.id;

		if(msg.params.length >= 1){
			self.db.getStats_cah(guildid, msg.mentions.users.first().id, (row) => {
				let message;
				if(row){
					message = self.createEmbed("purple", "<@" + row.id + "> has " + row.points + " points!");
				} else {
					message = self.createEmbed("purple", "<@" + msg.mentions.users.first().id + "> didn't won any rounds yet");
				}
				self.send(msg, message);
			});
		} else {
			self.db.getStats_cah(guildid, "top25", (rows) => {
				if(rows){
					let message = "Top 25:\n";
					for(let i = 0; i < rows.length; i++){
						message += "\n" + (1+i) + " - <@" + rows[i].id + ">: " + rows[i].points + " points";
					}
					message = self.createEmbed("purple", message, "Scoreboard:");
					self.send(msg, message);
				}
			});
		}
	}
}

function start(self, msg){
    game.start(self, msg);
}

function join(self, msg){
    game.join(self, msg);
}

function leave(self, msg){
    game.leave(self, msg);
}

function choose(self, msg){
    game.choose(self, msg);
}

function reset(self, msg){
    game.reset(self, msg);
}

function skip(self, msg){
	game.skip(self, msg);
}

function kick(self, msg){
	game.kick(self, msg);
}

function scoreboard(self, msg){
	game.scoreboard(self, msg);
}

const game = new gameHandler();

module.exports = {
	start: start,
	join: join,
	leave: leave,
	choose: choose,
	reset: reset,
	skip: skip,
	kick: kick,
	scoreboard: scoreboard
};
