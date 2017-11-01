module.exports = class Round{
    constructor(blackPlayer, blackCards, players){
        this.blackPlayer = blackPlayer;
        this.blackCards = blackCards;
        this.blackCard = "";
        this.pick = 1;
        this.players = players;
        this.choices = {};
        this.cards = [];
        this.cards_keys = [];
        this.status = "black";
    }

    choose(id, card){
        if(Object.keys(this.players).includes(id.toString())){
            switch (this.status) {
                case "black":
                    if(id == this.blackPlayer){
                        this.blackCard = this.blackCards[card[0]].text;
                        this.pick = this.blackCards[card[0]].text;
                        this.status = "white";

                        let id_private = [];
                        let description_private = [];

                        for(key in this.players){
                            if(key == this.blackPlayer) continue;
                            id_private.push(key);

                            let white_cards = this.players[key].Cards;
                            let text = "**Pick a card:**";

                            for(let i = 0; i < white_cards.length; i++){
                                text += "\n" + i + ": " + white_cards[i];
                            }
                            description_private.push(text);
                        }

                        return [{
                            status: "blackCard",
                            pick: this.pick,
                            private: true,
                            id_private: id_private,
                            description_private: description_private,
                            description: "The question is: " + this.blackCard,

                        }];
                    } else {
                        return [{
                            stats: "error",
                            description: "You can't choose an answer yet."
                        }];
                    }
                    break;
                case "white":
                    if(id == this.blackPlayer){
                        return [{
                            status: "error",
                            description: "Wait for all players to pick a card."
                        }];
                    }
                    if(card.length < this.pick){
                        return {
                            status: "error",
                            id: id,
                            description: "You need to choose atleast " + this.pick + " cards!"
                        }
                    }

                    this.choices[id] = [];
                    for(let i = 0; i < card.length; i++){
                        if(i == this.pick) break;
                        this.choices[id].push(this.players[id].playCard(card[i]));
                    }

                    if(Object.keys(this.choices).length == Object.keys(this.players).length - 1){
                        this.status = "choose";
                        let choices = Object.keys(this.choices);
                        while(choices.length > 0){
                            let key = choices.splice(Math.floor(Math.random()*choices.length), 1);
                            this.cards.push(this.choices[key]);
                            this.cards_keys.push(key);
                        }

                        let description_private = "**Choose the winning card:**";

                        for (let i = 0; i<this.cards.length; i++){
                            let qa = this.blackCard;

                            let cards = this.cards[i].slice(0);

                            if(qa.includes("\_")){
                                while(qa.includes("\_")){
                                    qa = qa.replace("\_", "**" + cards.shift() + "**");
                                }
                            } else {
                                qa = qa + " **" + cards.shift() + "**";
                            }
                            description_private += "\n" + i + ": " + qa;
                        }

                        return [
                            {
                                status: "whiteCard",
                                id: id,
                                description: "%player has chosen an answer"
                            },
                            {
                                status: "allchosen",
                                id: this.blackPlayer,
                                cards: this.cards,
                                private: true,
                                id_private: [this.blackPlayer],
                                description_private: [description_private],
                                description: "All players have picked an answer. %player must choose their favourite answer."
                            }
                        ];
                    } else {
                        return [{
                            status: "whiteCard",
                            id: id,
                            description: "%player has chosen an answer"
                        }];
                    }
                    break;
                case "choose":
                    if(id == this.blackPlayer){
                        let won = card[0];
                        won = this.cards_keys[won];

                        let points = this.players[won].won();
                        this.status = "ready";

                        var description = "%player won the round! **( " + this.players[won].points + " Points)** %won\n";

                        for(key in this.choices){
                            let qa = this.blackCard;

                            if(qa.includes("\_")){
                                while(qa.includes("\_")){
                                    qa = qa.replace("\_", "**" + this.choices[key].shift() + "**");
                                }
                            } else {
                                qa = qa + " **" + this.choices[key].shift() + "**";
                            }

                            if(key == won){
                                description = description.replace("%won", qa);
                            } else {
                                description += "\n<@" + key + ">: " + qa;
                            }
                        }

                        return [{
                            status: "roundWon",
                            id: won,
                            blackCard: this.blackCard,
                            whiteCards: this.choices,
                            description: description,
                            cards: this.choices
                        }];
                    } else {
                        return [{
                            stats: "error",
                            description: "You can't choose an answer yet."
                        }];
                    }
                    break;
                case "ready":
                    return [{
                        status: "done",
                        description: "You fucked up your code rewrite it :)"
                    }];
                    break;
                default:

            }
        } else {
            return [{
                status: "error",
                description: "Type %joincommand to enter the game"
            }];
        }
    }

    join(player){
        this.players[player.id] = player;
    }

    get hasToChoose(){
        return [];
    }
}
