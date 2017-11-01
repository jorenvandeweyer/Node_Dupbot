module.exports = class Player{
    constructor(id, stats=false){
        this.id = id;
        this.cards = [];
        if(stats){
            this.stats = stats;
        } else {
            this.stats = {
                points: 0
            }
        }
    }

    get Cards(){
        return this.cards;
    }

    get points(){
        return this.stats.points;
    }

    addCard(card){
        this.cards.push(card);
    }

    playCard(card){
        return this.cards.splice(card, 1);
    }

    won(){
        this.stats.points++;
    }

}
