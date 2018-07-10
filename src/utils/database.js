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

function getConnection() {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) return reject(err);
            resolve(connection);
        });
    }).catch((err) => {
        Logger.error(err);
    });
}

function query(query, options) {
    return new Promise(async (resolve, reject) => {
        let connection = await getConnection();

        if (!connection) return reject("[-]Couldn't create database connection.");

        connection.query(query, options, (err, result) => {
            connection.release();

            if (err) return reject(err);
            resolve(result);
        });
    }).catch((err) => {
        Logger.error(err);
    });
}

function setup(c) {
    Client = c;
    startUp(Client);
}

async function startUp(Client) {
    let result = await query(queries.tables.commands);
    if (result && !result.warningCount) Logger.info("[db]Created commands table");
    result = await query(queries.tables.guilds);
    if (result && !result.warningCount) Logger.info("[db]Created guilds table");
    result = await query(queries.tables.settings_default);
    if (result && !result.warningCount) Logger.info("[db]Created settings_default table");
    result = await query(queries.tables.stats_bot);
    if (result && !result.warningCount) Logger.info("[db]Created permissions table");
    result = await query(queries.tables.permissions);
    if (result && !result.warningCount) Logger.info("[db]Created permissions table");
    result = await query(queries.tables.settings);
    if (result && !result.warningCount) Logger.info("[db]Created settings table");
    result = await query(queries.tables.stats_cah);
    if (result && !result.warningCount) Logger.info("[db]Created stats_cah table");
    result = await query(queries.tables.stats_guild);
    if (result && !result.warningCount) Logger.info("[db]Created stats_guild table");
    result = await query(queries.tables.stats_users);
    if (result && !result.warningCount) Logger.info("[db]Created stats_user table");
    result = await query(queries.tables.modlog);
    if (result && !result.warningCount) Logger.info("[db]Created modlog table");
    result = await query(queries.tables.btc);
    if (result && !result.warningCount) Logger.info("[db]Created btc table");
    result = await query(queries.tables.events);
    if (result && !result.warningCount) Logger.info("[db]Created events table");

    await query("INSERT IGNORE INTO stats_bot VALUES ('messages', 0)");

    await query("SELECT guild FROM guilds").then(async (result) => {
        result = result.map(row => row.guild);
        if (!result.includes("0")) await addGuild("0");
        const guilds = Client.bot.guilds.filter(guild => !result.includes(guild.id));
        for (let guild of guilds) {
            Logger.log(guild[0]);
            await addGuild(guild[0]);
        }
    });

    await query("SELECT * FROM commands").then(async (result) => {
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
            let rows = await query("INSERT INTO commands(`command`, `permissions_default`) VALUES ?", [commands]);
            Logger.info(`[db]Inserted ${rows.affectedRows} commands in table commands`);
            let rows2 = await query(`INSERT INTO permissions SELECT guilds.guild_id, commands.command_id, commands.permissions_default FROM guilds INNER JOIN commands ON commands.command IN ('${commands.map(arr => arr[0]).join("','")}')`);
            Logger.info(`[db]Inserted ${rows2.affectedRows} commands in table permissions`);
        }

        for (let command of db_commands) {
            if (!Client.commands.has(command[0])) {
                await query("DELETE FROM commands WHERE `command`=?", [command[0]]);
                Logger.info(`[db]Deleted ${command[0]} command from table commands`);
            }
        }
    });

    await query("SELECT * FROM settings_default").then(async (result) => {
        let db_settings = new Map();
        let settings_q = [];
        if (result.length) {
            for (let i = 0; i < result.length; i++) {
                db_settings.set(result[i].setting, result[i].value_default);
            }
        }

        for (let setting in settings) {
            if(!db_settings.has(setting)) {
                settings_q.push([setting, settings[setting]]);
            } else {
                //check for update default values
            }
        }

        if (settings_q.length)  {
            let rows = await query("INSERT INTO settings_default(`setting`, `value_default`) VALUES ?", [settings_q]);
            Logger.info(`[db]Inserted ${rows.affectedRows} settings in table settings_default`);
            let rows2 = await query(`INSERT INTO settings SELECT guilds.guild_id, settings_default.setting_id, settings_default.value_default FROM guilds INNER JOIN settings_default ON settings_default.setting IN ('${settings_q.map(arr => arr[0]).join("','")}')`);
            Logger.info(`[db]Inserted ${rows2.affectedRows} settings in table settings`);
        }

        for (let setting of db_settings) {
            if (!(setting[0] in settings)) {
                await query("DELETE FROM settings_default WHERE `setting`=?", [setting[0]]);
                Logger.info(`[db]Deleted ${setting[0]} settining from table settings_default`);
            }
        }
    });

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
    let sql = queries.query.getPermissions;
    sql += " WHERE guilds.guild=?"; // remove when making a cache
    if (command !== "allPermissions") {
        sql += " AND commands.command=?";
    }

    let result = await query(sql, [guild, command]);
    if (command !== "allPermissions") {
        if (result && result.length) {
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
        return await query(queries.query.setPermissions, [value, guild, command]);
    } else {
        return Promise.reject("can't change permissions to level 4 or reduce their permissions levels");
    }
}

async function getSettings(guild, setting) {
    let sql = queries.query.getSettings;
    sql += " WHERE guilds.guild=?"; //replace when make a cache
    if (setting !== "allSettings") {
        sql += " AND settings_default.setting=?";
    }

    let result = await query(sql, [guild, setting]);
    if (setting !== "allSettings") {
        if (result && result.length) {
            return result[0].value;
        } else {
            return undefined;
        }
    } else {
        return result;
    }
}

async function setSettings(guild, setting, value) {
    return await query(queries.query.setSettings, [value, guild, setting]);
}

async function getStats_cah(guild, player) {
    let sql = queries.query.getStats_cah;

    if (player !== "top25") {
        sql += " AND stats_cah.user_id=?";
    } else {
        sql += " ORDER BY stats_cah.points DESC LIMIT 25";
    }

    let result = await query(sql, [guild, player]);

    if (player !== "top25") {
        if (result && result.length) {
            return result[0].points;
        } else {
            return undefined;
        }
    } else {
        return result;
    }
}

async function setStats_cah(guild, player, points) {
    let result = await getStats_cah(guild, player);

    if (result) {
        return await query(queries.query.setStats_cah.update, [points, guild, player]);
    } else {
        return await query(queries.query.setStats_cah.insert, [player, points, guild]);
    }
}

async function getStats_guild(guild, type) {
    return await query(queries.query.getStats_guild, [guild, type]);
}

async function setStats_guild(guild, type, value) {
    const timestamp = Date.now().toString();
    return await query(queries.query.setStats_guild, [type, timestamp, value, guild]);
}

async function getStats_bot(stat) {
    let result = await query(queries.query.getStats_bot, [stat]);

    if (result && result.length) {
        return result[0].value;
    } else {
        return undefined;
    }
}

async function setStats_bot(stat, value) {
    return await query(queries.query.setStats_bot, [value, stat]);
}

async function getBtc(guild, id) {
    let result = await query(queries.query.getBtc, [guild, id]);
    if (result && result.length) {
        return result;
    } else {
        return false;
    }
}

async function setBtc(guild, id, type, value) {
    let result = getBtc(guild, id);
    if (result) {
        return await query(queries.query.setBtc.update, [value, guild, id, type]);
    } else {
        return await query(queries.query.setBtc.insert, [id, value, type, guild]);
    }
}

async function getStats_users(guild, id) {
    let sql = queries.query.getStats_users;
    if (id === "all") {
        sql += " ORDER BY stats_users.value DESC";
    } else {
        sql += " AND stats_users.user_id=?";
    }

    let result = await query(sql, [guild, id]);

    if (id === "all") {
        return result;
    } else {
        if (result && result.length) {
            return result;
        } else {
            return false;
        }
    }
}

async function setStats_users(guild, id, type, value) {
    let result = await getStats_users(guild, id);
    if (result && result.length) {
        return await query(queries.query.setStats_users.update, [value, guild, id, type]);
    } else {
        return await query(queries.query.setStats_users.insert, [id, value, type, guild]);
    }
}

async function getModlog(guild, id) {
    return query(queries.query.getModlog, [guild, id]);
}

async function setModlog(guild, data) {
    let result = await query("SELECT * FROM guilds WHERE `guild`=?", [guild]);
    if (result && !result.length) return null;

    data.guild_id = result[0].guild_id;
    return await query(queries.query.setModlog, data);
}

async function getEvent(query_array) {
    let sql = queries.query.getEvent;

    for (let i = 0; i < query_array.length; i++) {
        sql += query_array[i];
    }

    sql += " ORDER BY events.execute_at ASC";

    return await query(sql);
}

async function setEvent(data) {
    return await query(queries.query.setEvent,
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
    return await query(queries.query.updateEvent, [status, id]);
}

async function editEvent(query_array, status) {
    let sql = queries.query.editEvent;

    for (let i = 0; i < query_array.length; i++) {
        sql += query_array[i];
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
