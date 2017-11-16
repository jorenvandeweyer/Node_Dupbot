module.exports = {
    eval : {
        description: "!eval <code>",
        defaultPermission: 4
    },
    evalT : {
        description: "!evalT <code>",
        defaultPermission: 4
    },
    fetch : {
        description: "!fetch",
        defaultPermission: 4
    },
    ping : {
        description: "!ping",
        defaultPermission: 1
    },
    kill: {
        description: "!kill [@user]",
        defaultPermission: 0
    },
    getroles : {
        description: "!getroles",
        defaultPermission: 1
    },
    say: {
        description: "!say <text>",
        defaultPermission: 2,
        failPermission: "You can't say things"
    },
    kick: {
        description: "!kick @user [reason]",
        defaultPermission: 2,
        failPermission: "You can't kick people :point_up:"
    },
    warn: {
        description: "!warn @user [reason]",
        defaultPermission: 2,
        failPermission: "You can't warn people :point_up:"
    },
    ban: {
        description: "!ban @user [reason]",
        defaultPermission: 2,
        failPermission: "You can't ban people :point_up:"
    },
    tempban: {
        description: "!tempban @user <time> [reason]",
        defaultPermission: 2,
        failPermission: "You can't ban people :point_up:"
    },
    unban: {
        description: "!unban @userID",
        defaultPermission: 2,
        failPermission: "You can't unban people :point_up:"
    },
    silence: {
        description: "!silence @name",
        defaultPermission: 2,
        failPermission: "You can't silence people :point_up:"
    },
    unsilence: {
        description: "!unsilence @name",
        defaultPermission: 2,
        failPermission: "You can't unsilence people :point_up:"
    },
    help: {
        description: "!help <command>",
        defaultPermission: 1
    },
    permissions: {
        description: "!permissions",
        defaultPermission: 3
    },
    see: {
        description: "!see @name",
        defaultPermission: 2,
        failPermission: "You can't see into people"
    },
    speed: {
        description: "!speed [market] [all]",
        defaultPermission: 0
    },
    reload: {
        description: "!reload",
        defaultPermission: 4,
        failPermission: "You can't reload the bot"
    },
    nuke: {
        description: "!nuke <amount>",
        defaultPermission: 3,
        failPermission: "You can't nuke idiot :point_up:"
    },
    set: {
        description: "!set <warntime, log, role, admin, deleteCommands, perm> <opt>",
        defaultPermission: 3,
        failPermission: "You can't edit the settings"
    },
    iam: {
        description: "!iam <role>",
        defaultPermission: 1
    },
    setrole: {
        description: "!setrole @name @role",
        defaultPermission: 2,
        failPermission: "You can't set roles."
    },
    delrole: {
        description: "!delrole @name @role",
        defaultPermission: 2,
        failPermission: "You can't delete roles."
    },
    play: {
        description: "!play <youtube url, song name>",
        defaultPermission: 1
    },
    skip: {
        description: "!skip (only own submissions)",
        defaultPermission: 1
    },
    queue: {
        description: "!queue",
        defaultPermission: 1
    },
    invite: {
        description: "!invite",
        defaultPermission: 1
    },
    cstart: {
        description: "!cstart [-rounds n] [-cards n]",
        defaultPermission: 1
    },
    cjoin: {
        description: "!cjoin",
        defaultPermission: 1
    },
    cleave: {
        description: "!cleave",
        defaultPermission: 1
    },
    c: {
        description: "!c <card>",
        defaultPermission: 1
    },
    choose: {
        description: "!choose <card>",
        defaultPermission: 1
    },
    creset: {
        description: "!creset",
        defaultPermission: 2,
        failPermission: "You can't reset the game"
    },
    cscoreboard: {
        description: "!cscoreboard <player>",
        defaultPermission: 1
    }
}
