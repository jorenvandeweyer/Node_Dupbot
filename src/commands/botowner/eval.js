module.exports = {
    name: "eval",
    description: "!eval <code>",
    usage: "<code>",
    defaultPermission: 4,
    args: 1,
    guildOnly: false,
    execute(Client, msg){
        try{
    		const code = msg.params.join(" ");
    		let evaled = eval(code);

    		if(typeof evaled !== "string"){
    			evaled = require("util").inspect(evaled);
    		}
    		msg.channel.send(">" + clean(code), {code:"xl"});
    		msg.channel.send(clean(evaled), {code:"xl"});
    	} catch(err){
    		msg.channel.send(clean(code), {code:"xl"});
    		msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    	}
    	return false;
    }
};

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}
