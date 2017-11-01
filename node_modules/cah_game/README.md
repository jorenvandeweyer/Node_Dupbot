## Cards Against Humanity Game Node Package ##

## Example script for implementation in a discord bot build on Discord.js##

```javascript

var cah = require("./examples/cahgamehandler");

function cahStartCommand(msg){
	cah.start(msg);
}

function cahJoinCommand(msg){
	cah.join(msg);
}

function cahLeaveCommand(msg){
	cah.leave(msg);
}

function cahChooseCommand(msg){
	cah.choose(msg);
}

function cahResetCommand(msg){
	if(!serverManager.isAdmin(msg)){
		message = createEmbed("purple", "You can't reset the game");
		send(msg, message);
		return;
	}
	cah.reset(msg);
}
```
