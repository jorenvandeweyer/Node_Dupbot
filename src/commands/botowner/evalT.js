module.exports = {
    name: "evalt",
    usage: "<code>",
    defaultPermission: 4,
    args: 1,
    guildOnly: false,
    execute (Client, msg) {
        const code = msg.params.join(" ");
        try {
            require("child_process").exec(code, (error, stdout) => {
                msg.channel.send(">" + clean(code), {code:"xl"});
                if (error !== null) msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
                let message = stdout;
                if (message.length > 1700) {
                    message = splitter(message, 1700);
                    while (message.length > 0) {
                        msg.channel.send(clean(message.shift()), {code: "xl"});
                    }
                } else {
                    msg.channel.send(clean(message), {code: "xl"});
                }
            });
        } catch (err) {
            msg.channel.send(code, {code:"xl"});
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


function splitter(str, l) {
    let strs = [];
    while (str.length > l) {
        let pos = str.substring(0, l).lastIndexOf(" ");
        pos = pos <= 0 ? l : pos;
        strs.push(str.substring(0, pos));
        let i = str.indexOf(" ", pos)+1;
        if (i < pos || i > pos+l)
            i = pos;
        str = str.substring(i);
    }
    strs.push(str);
    return strs;
}
