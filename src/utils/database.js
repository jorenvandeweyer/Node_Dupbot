// const util = require("util");
const mysql = require("mysql");
const settings = require(__dirname + "/../../data/default");
const Logger = require("../../src/utils/logger");
const { mysql_host, mysql_user, mysql_pswd, mysql_db} = require("../../serverSettings.json");

const queries = require("./queries.json");

let Client;
const pool = mysql.createPool({
    host: mysql_host,
    user: mysql_user,
    password: mysql_pswd,
    database: mysql_db
});

// const getConnection = util.promisify(pool.getConnection);
//
// async function query(query, options) {
//     const connection = await getConnection().catch((err) => {
//         Logger.error(err);
//     });
//     const q = util.promisify(connection.query);
//
//     return await q(query, options).catch((err) => {
//         Logger.error(err);
//     });
// }

function getConnection() {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) return reject(err);
            resolve(connection);
        });
    }).catch((err) => {
        Logger.error(err);
        return null;
    });
}


function query(query, options) {
    return new Promise(async (resolve, reject) => {
        let connection = await getConnection();
        connection.query(query, options, (err, result) => {
            connection.release();

            if (err) return reject(err);
            resolve(result);
        });
    }).catch((err) => {
        Logger.error(err);
        return null;
    });
}

function setup(c) {
    Client = c;
    startUp(Client);
}

let queries;

async function startUp(Client) {
    await query(queries.tables.commands);
    Logger.info("[db]Created commands table")
    await query(queries.tables.guilds);
    Logger.info("[db]Created guilds table")
    await query(queries.tables.settings_default);
    Logger.info("[db]Created settings_default table")
    await query(queries.tables.stats_bot);
    Logger.info("[db]Created permissions table")
    await query(queries.tables.permissions);
    Logger.info("[db]Created permissions table")
    await query(queries.tables.settings);
    Logger.info("[db]Created settings table")
    await query(queries.tables.stats_cah);
    Logger.info("[db]Created stats_cah table")
    await query(queries.tables.stats_guild);
    Logger.info("[db]Created stats_guild table");
    await query(queries.tables.stats_users);
    Logger.info("[db]Created stats_user table");
    await query(queries.tables.modlog);
    Logger.info("[db]Created modlog table");
    await query(queries.tables.btc);
    Logger.info("[db]Created btc table");
    await query(queries.tables.events);
    Logger.info("[db]Created events table");

    await query("INSERT IGNORE INTO stats_bot VALUES ('messages', 0)");

    await query("SELECT guild FROM guilds").then((result) => {
        result = result.map(row => row.guild);
        await addGuild("0");
        const guilds = Client.bot.guilds.filter(guild => !result.includes(guild.id));
        for (let guild in guilds) {
            console.log(guild.id);
            await addGuild(guild.id);
        }
    }).catch(e => Logger.error(e));

    await query("SELECT * FROM commands").then((result) => {

    }).catch(e => Logger.error(e));

}

function startUp(Client) {
        if (!db_tables.includes("commands")) {
            con.query("CREATE TABLE commands (`command_id` INT UNSIGNED AUTO_INCREMENT, `command` VARCHAR(64) UNIQUE, `permissions_default` INT UNSIGNED, PRIMARY KEY (`command_id`))", (err) => {
                if (err) return Client.sys("error", err);
                let commands = [];

                for (let command of Client.commands) {
                    commands.push([command[0], command[1].defaultPermission]);
                }

                if (commands.length) {
                    con.query("INSERT INTO commands(`command`, `permissions_default`) VALUES ?", [commands], (err, result) => {
                        if (err) return Client.sys("error", err);
                        Client.sys("log", `[db]Inserted ${result.affectedRows} commands in table commands`);
                    });
                }
            });
        } else {
            con.query("SELECT * FROM commands", (err, result) => {
                if (err) return Client.sys("error", err);
                let db_commands = new Map();
                let commands = [];
                if (result.length) {
                    for (let i = 0; i < result.length; i++) {
                        db_commands.set(result[i].command, result[i].permissions_default);
                    }
                }

                for (let command of Client.commands) {
                    if (!db_commands.has(command[0])) {
                        commands.push([command[0], command[1].defaultPermission]);
                    } else {
                        //check for update default permissions
                    }
                }

                if (commands.length) {
                    con.query("INSERT INTO commands(`command`, `permissions_default`) VALUES ?", [commands], (err, result) => {
                        if (err) return Client.sys("error", err);
                        Client.sys("log", `[db]Inserted ${result.affectedRows} commands in table commands`);
                        con.query("INSERT INTO permissions SELECT guilds.guild_id, commands.command_id, commands.permissions_default FROM guilds INNER JOIN commands ON commands.command IN (?) ", [commands.map(arr => arr[0]).join(",")], (err, result) => {
                            if (err) return Client.sys("error", err);
                            Client.sys("log", `[db]Inserted ${result.affectedRows} commands in table permissions`);
                        });
                    });
                }

                for (let command of db_commands) {
                    if (!Client.commands.has(command[0])) {
                        con.query("DELETE FROM commands WHERE `command`=?", [command[0]], (err) => {
                            if (err) return Client.sys("error", err);
                            Client.sys("log", `[db]Deleted ${command[0]} command from table commands`);
                        });
                    }
                }
            });
        }

        if (!db_tables.includes("settings_default")) {
            con.query("CREATE TABLE settings_default (`setting_id` INT UNSIGNED AUTO_INCREMENT, `setting`VARCHAR(64) UNIQUE, `value_default` TEXT, PRIMARY KEY (`setting_id`))", (err) =>{
                if (err) return Client.sys("error", err);
                let settings_q = [];

                for (let setting in settings) {
                    settings_q.push([setting, settings[setting]]);
                }

                if (settings_q.length) {
                    con.query("INSERT INTO settings_default(`setting`, `value_default`) VALUES ?", [settings_q], (err, result) => {
                        if (err) return Client.sys("error", err);
                        Client.sys("log", `[db]Inserted ${result.affectedRows} settings in table settings_default`);
                    });
                }
            });
        } else {
            con.query("SELECT * FROM settings_default", (err, result) => {
                if (err) return Client.sys("error", err);
                let db_settings = new Map();
                let settings_q = [];
                if (result.length) {
                    for (let i = 0; i < result.length; i++) {
                        db_settings.set(result[i].setting, result[i].value_default);
                    }
                }

                for (let setting in settings) {
                    if (!db_settings.has(setting)) {
                        settings_q.push([setting, settings[setting]]);
                    } else {
                        //check for update default values
                    }
                }

                if (settings_q.length) {
                    con.query("INSERT INTO settings_default(`setting`, `value_default`) VALUES ?", [settings_q], (err, result) => {
                        if (err) return Client.sys("error", err);
                        Client.sys("log", `[db]Inserted ${result.affectedRows} settings in table settings_default`);
                        con.query(`INSERT INTO settings SELECT guilds.guild_id, settings_default.setting_id, settings_default.value_default FROM guilds INNER JOIN settings_default ON settings_default.setting IN ('${settings_q.map(arr => arr[0]).join("','")}')`, [], (err, result) => {
                            if (err) return Client.sys("error", err);
                            Client.sys("log", `[db]Inserted ${result.affectedRows} settings in table settings`);
                        });
                    });
                }

                for (let setting of db_settings) {
                    if (!(setting[0] in settings)) {
                        con.query("DELETE FROM settings_default WHERE `setting`=?", [setting[0]], (err) => {
                            if (err) return Client.sys("error", err);
                            Client.sys("log", `[db]Deleted ${setting[0]} settining from table settings_default`);
                        });
                    }
                }
            });
        }

}


async function addGuild(guild) {
    await query("INSERT INTO guilds (`guild`) VALUES (?)", [guild]);
    await query("INSERT INTO permissions SELECT guilds.guild_id, commands.command_id, commands.permissions_default FROM commands INNER JOIN guilds ON guilds.guild=?", [guild]);
    Logger.info(`[db]Added permissions for guild ${guild}`);
    await query("INSERT INTO settings SELECT guilds.guild_id, settings_default.setting_id, settings_default.value_default FROM settings_default INNER JOIN guilds ON guilds.guild=?", [guild]);
    Logger.info(`[db]Added settings for guild ${guild}`);
}

async function deleteGuild(guild) {
    return await query("DELETE FROM guilds WHERE `guild`=?", [guild]);
}

async function rebuildGuild(guild) {
    await deleteGuild(guild);
    await addGuild(guild);
}

async function getPermissions(guild, command) {
    let sql = "SELECT guilds.guild, commands.command, permissions.value FROM permissions INNER JOIN guilds ON guilds.guild_id=permissions.guild_id INNER JOIN commands ON commands.command_id=permissions.command_id";
    sql += " WHERE guilds.guild=?"; // remove when making a cache
    if (command !== "allPermissions") {
        sql += " AND commands.command=?";
    }

    let result = await query(sql, [guild, command]);
    if (command !== "allPermissions") {
        if (result.length) {
            return result[0].value;
        } else {
            return undefined;
        }
    } else {
        return result;
    }
}

async function setPermissions(guild, command, value) {
    let result = getPermissions(guild, command);

    if (result != 4 && value != 4) {
        return await query("UPDATE permissions SET `value`=? WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?) AND `command_id`=(SELECT `command_id` FROM commands WHERE `command`=?)", [value, guild, command]);
    } else {
        return Promise.reject("can't change permissions to level 4 or reduce their permissions levels")
    }
}

async function getSettings(guild, setting) {
    let sql = "SELECT guilds.guild, settings_default.setting, settings.value FROM settings INNER JOIN guilds ON guilds.guild_id=settings.guild_id INNER JOIN settings_default ON settings_default.setting_id=settings.setting_id";
    sql += " WHERE guilds.guild=?"; //replace when make a cache
    if (setting !== "allSettings") {
        sql += " AND settings_default.setting=?";
    }

    let result = await query(sql, [guild, setting]);
    if (setting !== "allSettings") {
        if (result.length) {
            return result[0].value;
        } else {
            return undefined;
        }
    } else {
        return result;
    }
}

async function setSettings(guild, setting, value) {
    return await query("UPDATE settings SET `value`=? WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?) AND `setting_id`=(SELECT `setting_id` FROM settings_default WHERE `setting`=?)", [value, guild, setting]);
}

async function getStats_cah(guild, player) {
    let sql = "SELECT guilds.guild, stats_cah.user_id, stats_cah.points FROM stats_cah INNER JOIN guilds ON guilds.guild_id=stats_cah.guild_id WHERE guilds.guild=?";

    if (player !== "top25") {
        sql += " AND stats_cah.user_id=?";
    } else {
        sql += " ORDER BY stats_cah.points DESC LIMIT 25";
    }

    let result = await query(sql, [guild, player]);

    if (player !== "top25") {
        if (result.length) {
            return result[0].points;
        } else {
            return undefined;
        }
    } else {
        return result;
    }
}

async function setStats_cah(guild, player, points) {
    let result = await query("UPDATE stats_cah SET `points`=`points`+? WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?) AND `user_id`=?", [points, guild, player]);

    if (result) {
        return await query("UPDATE stats_cah SET `points`=`points`+? WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?) AND `user_id`=?", [points, guild, player]);
    } else {
        return await query("INSERT INTO stats_cah SELECT guilds.guild_id, ?, ? FROM guilds WHERE guilds.guild = ?", [player, points, guild]);
    }
}

async function getStats_guild(guild, type) {
    return await query("SELECT guilds.guild, stats_guild.type, stats_guild.timestamp, stats_guild.value FROM stats_guild INNER JOIN guilds ON guilds.guild_id=stats_guild.guild_id WHERE guilds.guild=? AND stats_guild.type=? ORDER BY timestamp ASC", [guild, type]);
}

async function setStats_guild(guild, type, value) {
    const timestamp = Date.now().toString();
    return await query("INSERT INTO stats_guild SELECT guilds.guild_id, ?, ?, ? FROM guilds WHERE guilds.guild=?", [type, timestamp, value, guild]);
}

async function getStats_bot(stat) {
    let result = await query("SELECT value FROM stats_bot WHERE stat=?", [stat]);

    if (result.length) {
        return result[0].value;
    } else {
        return undefined;
    }
}

async function setStats_bot(stat, value) {
    return await query("UPDATE stats_bot SET value=value+? WHERE stat=?", [value, stat]);
}

async function getBtc(guild, id) {
    let result = await query("SELECT guilds.guild, btc.user_id, btc.value, btc.type FROM btc INNER JOIN guilds ON guilds.guild_id=btc.guild_id WHERE guilds.guild=? AND btc.user_id=?", [guild, id]);
    if (result.length) {
        return result;
    } else {
        return false;
    }
}

async function setBtc(guild, id, type, value) {
    let result = getBtc(guild, id);
    if (result) {
        return await query("UPDATE btc SET `value`=? WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?) AND `user_id`=? AND `type`=?", [value, guild, id, type]);
    } else {
        return await query("INSERT INTO btc SELECT guilds.guild_id, ?, ?, ? FROM guilds WHERE guilds.guild = ?", [id, value, type, guild]);
    }
}

async function getStats_users(guild, id) {
    let sql = "SELECT guilds.guild, stats_users.user_id, stats_users.value, stats_users.type FROM stats_users INNER JOIN guilds ON guilds.guild_id=stats_users.guild_id WHERE guilds.guild=?";
    if (id === "all") {
        sql += " ORDER BY stats_users.value DESC";
    } else {
        sql += " AND stats_users.user_id=?";
    }

    let result = await query(sql, [guild, id]);

    if (id === "all") {
        return result;
    } else {
        if (result.length) {
            return result;
        } else {
            return false;
        }
    }
}

async function setStats_users(guild, id, type, value) {
    let result = await getStats_users(guild, id);
    if (result.length) {
        return await query("UPDATE stats_users SET `value`=`value`+? WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?) AND `user_id`=? AND `type`=?", [value, guild, id, type]);
    } else {
        return await query("INSERT INTO stats_users SELECT guilds.guild_id, ?, ?, ? FROM guilds WHERE guilds.guild = ?", [id, value, type, guild]);
    }
}

async function getModlog(guild, id) {
    return query("SELECT modlog.id, guilds.guild, modlog.user, modlog.type, modlog.mod, modlog.timestamp, modlog.reason, modlog.time FROM modlog INNER JOIN guilds ON guilds.guild_id=modlog.guild_id WHERE guilds.guild=? AND modlog.user=?", [guild, id]);
}

async function setModlog(guild, data) {
    let result = await query("SELECT * FROM guilds WHERE `guild`=?", [guild]);
    if (!result.length) return null;

    data.guild_id = result[0].guild_id;
    return await query("INSERT INTO modlog SET ?", data);

}

async function getEvent(query) {
    let sql = "SELECT events.id, events.created_at, events.execute_at, guilds.guild, events.channel_id, events.initiator_id, events.action, events.target_id, events.data, events.status FROM events INNER JOIN guilds ON guilds.guild_id=events.guild_id WHERE true";

    for (let i = 0; i < query.length; i++) {
        sql += query[i];
    }

    sql += " ORDER BY events.execute_at ASC";

    return await query(sql);
}

async function setEvent(data) {
    return await query("INSERT INTO events (`execute_at`, `guild_id`, `channel_id`, `initiator_id`, `action`, `target_id`, `data`, `status`) SELECT FROM_UNIXTIME(?), guilds.guild_id, ?, ?, ?, ?, ?, ? FROM guilds WHERE guilds.guild = ?",
        [
            parseInt(data.execute_at)/1000,
            data.channel_id,
            data.initiator_id,
            data.action,
            data.target_id,
            data.data,
            data.status,
            data.guild_id
        ]);
}

async function updateEvent(id, status) {
    return await query("UPDATE events SET `status`=? WHERE `id`=?", [status, id]);
}

async function editEvent(query, status) {
    let sql = "UPDATE events SET `status`=? WHERE true";

    for (let i = 0; i < query.length; i++) {
        sql += query[i];
    }

    return await query(sql, [status]);
}

function close() {
    pool.end();
    Logger.info("Pool closed. All connections released");
}

module.exports = {
    query,
    executeStatement: query,
    setup,
    addGuild,
    deleteGuild,
    rebuildGuild,
    deleteTable,
    rebuildTable,
    getPermissions,
    setPermissions,
    getSettings,
    setSettings,
    getStats_cah,
    setStats_cah,
    getStats_guild,
    setServerStats: setStats_guild,
    getStats_bot,
    setStats_bot,
    setBtc,
    getBtc,
    getStats_users,
    setStats_users,
    getModlog,
    setModlog,
    getEvent,
    setEvent,
    updateEvent,
    editEvent,
    close
};
