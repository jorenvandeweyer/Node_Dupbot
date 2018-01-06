let queue = new Map();

module.exports = {
    get queue(){
        return queue;
    },
    addSong(msg){
        checkType.call(this, msg);
    }
};

function checkType(msg){
    this.send(msg, msg.params.join(" "));
}
