const cards = require("./content/cards");
const Player = require("./src/player");
const Round = require("./src/round");

var game;

class CAH {
    constructor(owner, cards=5, rounds=5, packs=["Base"]){
        if(cards < 3){
            cards = 3;
        }
        if(rounds < 1){
            rounds = 1;
        }

        this.owner = owner;
        this.packs = packs;
        this.cards = cards;
        this.rounds = rounds;

        this.round;
        this.currentRound = 0;

        this.whiteCards = [];
        this.blackCards = [];
        this.players = {};

        this.fillDecks();
    }

    static get packs(){
        return cards.order;
    }

    get whiteCard(){
        if(this.whiteCards.length == 0){
            this.fillDecks(true, false);
        }

        return this.whiteCards.splice(Math.floor(Math.random()*this.whiteCards.length), 1)[0];
    }

    get blackCard(){
        if(this.blackCards.length == 0){
            this.fillDecks(false, true);
        }

        return this.blackCards.splice(Math.floor(Math.random()*this.blackCards.length), 1)[0];
    }

    fillDecks(white=true, black=true){
        for (let i = 0; i<this.packs.length; i++){
            if(cards.order.includes(this.packs[i])){
                let pack = cards[this.packs[i]];
                //console.log(pack);
                if(white){
                    this.whiteCards = this.whiteCards.concat(pack.white);
                }
                if(black){
                    this.blackCards = this.blackCards.concat(pack.black);
                }
            }
        }
        if(this.whiteCards.length == 0 || this.blackCards == 0){
            this.packs.push("Base");
            this.fillDecks()
        }
    }

    join(id){
        let player = new Player(id);

        while(player.Cards.length < this.cards){
            player.addCard(cards.whiteCards[this.whiteCard]);
        }

        this.players[id] = player;

        if(this.round){
            this.round.join(player);
        }

        return [{
            action: "joined",
            id: id,
            description: "%player has joined the game"
        }];
    }

    leave(id){
        let player = this.players[id];
        if(player == undefined) return [{status: "error", id:id, description: "%player is not in the game"}];

        delete this.players[id];
        if(Object.keys(this.players).length < 3){
            return [{
                status: "finished",
                id: id,
                description: "%player left the game, not enough players left, games has ended"
            }];
        } else {
            return [{
                status: "left",
                id: id,
                description: "%player left the game"
            }];
        }
    }

    start(){
        if (Object.keys(this.players).length < 3){
            return [{
                status: "error",
                description: "Not enough players yet!"
            }];
        }

        return this.nextRound();
    }

    nextRound(){
        if(this.currentRound++ >= this.rounds){
            return [{
                status: "finished",
                description: "The game is finished, start another one!"
            }];
        }
        let blackPlayer = Object.keys(this.players)[Math.floor(Math.random()*Object.keys(this.players).length)];
        let blackCards = [];

        while(blackCards.length < this.cards){
            blackCards.push(cards.blackCards[this.blackCard]);

        }
        for(let player in this.players){
            while(this.players[player].Cards.length < this.cards){
                this.players[player].addCard(cards.whiteCards[this.whiteCard]);
            }
        }

        this.round = new Round(blackPlayer, blackCards, this.players);

        let description_private = "Choose a question:";

        for(let i = 0; i < blackCards.length; i++){
            description_private += "\n" + i + ": " + blackCards[i].text;
        }
        return [{
            status: "round",
            private: true,
            id_private: [blackPlayer],
            description_private: [description_private],
            id: blackPlayer,
            description: "%player has to choose a black card"
        }];
    }

    choose(id, cards){
        if(this.round){
            let round = this.round.choose(id, cards);
            if(round[0].status == "roundWon"){
                return round.concat(this.nextRound());
            } else {
                return round;
            }
        } else {
            return [{
                status: "error",
                description: "there is no round going on."
            }];
        }
    }

}

module.exports = class CAHGame{
    constructor(id, cards=5, rounds=5, packs=["Base"]){
        this.owner = id;
        this.started = false;
        this.cah = new CAH(id, cards=cards, rounds=rounds, packs=packs);
    }

    join(id){
        return this.cah.join(id);
    }

    choose(id, cards){
        return this.cah.choose(id, cards);
    }

    start(){
        this.started = true;
        return this.cah.start();
    }

    leave(id){
        return this.cah.leave(id);
    }

    addPacks(pack){
        return this.cah.addPacks(packs);
    }

}
