const mysql = require('mysql');
const settings = require(__dirname + '/../data/default');
const {mysql_host, mysql_user, mysql_pswd, mysql_db} = require("../serverSettings.json");

const con = mysql.createConnection({
  host: mysql_host,
  user: mysql_user,
  password: mysql_pswd,
  database: mysql_db
});

function setup(Client){
    con.connect(function(err) {
        if (err) throw err;
        startUp(Client);
    });
}

function startUp(Client){
    con.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='${mysql_db}'`, (err, result) => {
        if(err) console.error(err),process.exit();
        let db_tables = [];
        if(result.length){
            for(let i = 0; i < result.length; i++){
                db_tables.push(result[i].table_name);
            }
        }

        if(!db_tables.includes("commands")){
            con.query("CREATE TABLE commands (`command_id` INT UNSIGNED AUTO_INCREMENT, `command` VARCHAR(64) UNIQUE, `permissions_default` INT UNSIGNED, PRIMARY KEY (`command_id`))", (err, result) => {
                if(err) console.error(err),process.exit();
                let commands = [];

                for(let command of Client.bot.commands){
                    commands.push([command[0], command[1].defaultPermission]);
                }

                if(commands.length){
                    con.query("INSERT INTO commands(`command`, `permissions_default`) VALUES ?", [commands], (err, result) => {
                        if(err) console.error(err),process.exit();
                        console.log(`[db]Inserted ${result.affectedRows} commands in table commands`);
                    });
                }
            });
        } else {
            con.query("SELECT * FROM commands", (err, result) => {
                if(err) console.error(err),process.exit();
                let db_commands = new Map();
                let commands = [];
                if(result.length){
                    for(let i = 0; i < result.length; i++){
                        db_commands.set(result[i].command, result[i].permissions_default);
                    }
                }

                for(let command of Client.bot.commands){
                    if(!db_commands.has(command[0])){
                        commands.push([command[0], command[1].defaultPermission]);
                    } else {
                        //check for update default permissions
                    }
                }

                if(commands.length){
                    con.query("INSERT INTO commands(`command`, `permissions_default`) VALUES ?", [commands], (err, result) => {
                        if(err) console.error(err),process.exit();
                        console.log(`[db]Inserted ${result.affectedRows} commands in table commands`);
                    });
                }

                for(let command of db_commands){
                    if(!Client.bot.commands.has(command[0])){
                        con.query("DELETE FROM commands WHERE `command`=?", [command[0]], (err, result) => {
                            if(err) console.error(err),process.exit();
                            console.log(`[db]Deleted ${command[0]} command from table commands`);
                        });
                    }
                }
            });
        }
        if(!db_tables.includes("guilds")){
            con.query("CREATE TABLE guilds (`guild_id` INT UNSIGNED AUTO_INCREMENT, `guild` VARCHAR(32) UNIQUE, PRIMARY KEY (`guild_id`))", (err, result) => {
                if(err) console.error(err),process.exit();
                for(let guild of Client.bot.guilds){
                    addGuild(guild[0]);
                }
            });
        } else {
            con.query("SELECT * FROM guilds", (err, result) => {
                if(err) console.error(err),process.exit();
                let db_guilds = [];
                if(result.length){
                    for(let i = 0; i < result.length; i++){
                        db_guilds.push(result[i].guild);
                    }
                }

                for(let guild of Client.bot.guilds){
                    if(!db_guilds.includes(guild[0])){
                        addGuild(guild[0]);
                    }
                }
            });
        }
        if(!db_tables.includes("settings_default")){
            con.query("CREATE TABLE settings_default (`setting_id` INT UNSIGNED AUTO_INCREMENT, `setting`VARCHAR(64) UNIQUE, `value_default` TEXT, PRIMARY KEY (`setting_id`))", (err, result) =>{
                if(err) console.error(err),process.exit();
                let settings_q = [];

                for(let setting in settings){
                    settings_q.push([setting, settings[setting]]);
                }

                if(settings_q.length){
                    con.query("INSERT INTO settings_default(`setting`, `value_default`) VALUES ?", [settings_q], (err, result) => {
                        if(err) console.error(err),process.exit();
                        console.log(`[db]Inserted ${result.affectedRows} settings in table settings_default`);
                    });
                }
            });
        } else {
            con.query("SELECT * FROM settings_default", (err, result) => {
                if(err) console.error(err),process.exit();
                let db_settings = new Map();
                let settings_q = [];
                if(result.length){
                    for(let i = 0; i < result.length; i++){
                        db_settings.set(result[i].setting, result[i].value_default);
                    }
                }

                for(let setting in settings){
                    if(!db_settings.has(setting)){
                        settings_q.push([setting, settings[setting]]);
                    } else {
                        //check for update default values
                    }
                }

                if(settings_q.length){
                    con.query("INSERT INTO settings_default(`setting`, `value_default`) VALUES ?", [settings_q], (err, result) => {
                        if(err) console.error(err),process.exit();
                        console.log(`[db]Inserted ${result.affectedRows} settings in table settings_default`);
                    });
                }

                for(let setting of db_settings){
                    if(!(setting[0] in settings)){
                        con.query("DELETE FROM settings_default WHERE `setting`=?", [setting[0]], (err, result) => {
                            if(err) console.error(err),process.exit();
                            console.log(`[db]Deleted ${setting[0]} settining from table settings_default`);
                        });
                    }
                }
            });
        }

        if(!db_tables.includes("stats_bot")){
            con.query("CREATE TABLE stats_bot (`stat` VARCHAR(64),`value` BIGINT(255),PRIMARY KEY (`stat`))", (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Created stats_bot table");
                con.query("INSERT INTO stats_bot VALUES ('messages', 0)", (err, result) => {
                    if(err) console.error(err),process.exit();
                });
            });
        }
        if(!db_tables.includes("permissions")){
            con.query("CREATE TABLE permissions (`guild_id` INT UNSIGNED, `command_id` INT UNSIGNED, `value` INT UNSIGNED, FOREIGN KEY (`command_id`) REFERENCES commands(`command_id`) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`) ON DELETE CASCADE ON UPDATE CASCADE, UNIQUE `combined_index` (`guild_id`, `command_id`))", (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Created permissions table");
            });
        }
        if(!db_tables.includes("settings")){
            con.query("CREATE TABLE settings (`guild_id` INT UNSIGNED, `setting_id` INT UNSIGNED, `value` TEXT, FOREIGN KEY (`setting_id`) REFERENCES settings_default(`setting_id`) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`) ON DELETE CASCADE ON UPDATE CASCADE, UNIQUE `combined_index` (`guild_id`, `setting_id`))", (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Created settings table");
            });
        }
        if(!db_tables.includes("stats_cah")){
            con.query("CREATE TABLE stats_cah (`guild_id` INT UNSIGNED, `user_id` VARCHAR(32), `points` INT UNSIGNED, FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`) ON DELETE CASCADE ON UPDATE CASCADE, UNIQUE `combined_index` (`guild_id`, `user_id`))", (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Created stats_cah table");
            });
        }
        if(!db_tables.includes("stats_guild")){
            con.query("CREATE TABLE stats_guild (`guild_id` INT UNSIGNED, `type` VARCHAR(64), `timestamp` VARCHAR(32), `value` VARCHAR(32), FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`) ON DELETE CASCADE ON UPDATE CASCADE)", (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Created stats_guild table");
            });
        }
        if(!db_tables.includes("stats_users")){
            con.query("CREATE TABLE stats_users (`guild_id` INT UNSIGNED, `user_id` VARCHAR(32), `value` INT UNSIGNED, `type` VARCHAR(16), FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`) ON DELETE CASCADE ON UPDATE CASCADE, UNIQUE `combined_index` (`guild_id`, `user_id`))", (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Created stats_user table");
            });
        }
        if(!db_tables.includes("modlog")){
            con.query("CREATE TABLE modlog (`id` INT UNSIGNED AUTO_INCREMENT, `guild_id` INT UNSIGNED, `user` VARCHAR(32), `type` VARCHAR(16), `mod` VARCHAR(32), `timestamp` VARCHAR(32), `reason` VARCHAR(255), `time` VARCHAR(32), FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`) ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY (`id`))", (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Created modlog table");
            });
        }
        if(!db_tables.includes("btc")){
            con.query("CREATE TABLE btc (`guild_id` INT UNSIGNED, `user_id` VARCHAR(32), `value` DOUBLE(32,8), `type` VARCHAR(5), FOREIGN KEY (`guild_id`) REFERENCES guilds(`guild_id`) ON DELETE CASCADE ON UPDATE CASCADE,UNIQUE combined_index (`guild_id`, `user_id`))", (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Created btc table");
            });
        }
    });
}

function addGuild(guild){
    console.log(guild);
    con.query("INSERT INTO guilds (`guild`) VALUES (?)", [guild], (err, result) => {
        if(err) console.error(err),process.exit();

        con.query("INSERT INTO permissions SELECT guilds.guild_id, commands.command_id, commands.permissions_default FROM commands INNER JOIN guilds ON guilds.guild=?", [guild], (err, result) => {
            if(err) console.error(err),process.exit();
            console.log(`[db]Added permissions for guild ${guild}`);
        });

        con.query("INSERT INTO settings SELECT guilds.guild_id, settings_default.setting_id, settings_default.value_default FROM settings_default INNER JOIN guilds ON guilds.guild=?", [guild], (err, result) => {
            if(err) console.error(err),process.exit();
            console.log(`[db]Added settings for guild ${guild}`);
        });
    });
}

function deleteGuild(guild, ... _callback){
    con.query("DELETE FROM guilds WHERE `guild`=?", [guild], (err, result) => {
        if(err) console.error(err),process.exit();
        typeof _callback[0] === 'function' && _callback[0]();
    });
}

function rebuildGuild(guild, ... args){
    deleteGuild(guild, () => {
        addGuild(guild);
    });
}

function rebuildTable(table, ... args){
    deleteTable(table, () => {
        startUp(args[0])
    });
}

function deleteTable(table, ... _callback){
    con.query(`DROP TABLE ${table}`, (err, result) => {
        if(err) console.error(err),process.exit();
        typeof _callback[0] === 'function' && _callback[0]();
    });
}

function resetDatabase(db){
    con.query("DELETE FROM ?", [db], (err, result) => {
        if(err) console.error(err),process.exit();
        console.log(`Reset: ${db}`);
    });
}

function getPermissions(guild, command, _callback){
    let sql = "SELECT guilds.guild, commands.command, permissions.value FROM permissions INNER JOIN guilds ON guilds.guild_id=permissions.guild_id INNER JOIN commands ON commands.command_id=permissions.command_id";
    sql += " WHERE guilds.guild=?"; // remove when making a cache
    if(command !== "allPermissions"){
        sql += " AND commands.command=?";
    }

    con.query(sql, [guild, command], (err, result) => {
        if(err) console.error(err),process.exit();
        _callback(result)
    });
}

function setPermissions(guild, command, value){
    getPermissions(guild, command, (result) => {
        if(result[0].value !== "4"){
            con.query("UPDATE permissions SET `value`=? WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?) AND `command_id`=(SELECT `command_id` FROM commands WHERE `command`=?)", [value, guild, command], (err, result) => {
                if(err) console.error(err),process.exit();

            });
        }
    });
}

function getSettings(guild, setting, _callback){
    let sql = "SELECT guilds.guild, settings_default.setting, settings.value FROM settings INNER JOIN guilds ON guilds.guild_id=settings.guild_id INNER JOIN settings_default ON settings_default.setting_id=settings.setting_id"
    sql += " WHERE guilds.guild=?" //replace when make a cache
    if(setting !== "allSettings"){
        sql += " AND settings_default.setting=?";
    }

    con.query(sql, [guild, setting], (err, result) => {
        if(err) console.error(err),process.exit();
        _callback(result);
    });
}

function setSettings(guild, setting, value, ... _callback){
    con.query("UPDATE settings SET `value`=? WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?) AND `setting_id`=(SELECT `setting_id` FROM settings_default WHERE `setting`=?)", [value, guild, setting], (err, result) => {
        if(err) console.error(err),process.exit();
        typeof _callback[0] === "function" && _callback[0]();
    });
}

function getStats_cah(guild, player, _callback){
    let sql = "SELECT guilds.guild, stats_cah.user_id, stats_cah.points FROM stats_cah INNER JOIN guilds ON guilds.guild_id=stats_cah.guild_id WHERE guilds.guild=?";

    if(player !== "top25"){
        sql += " AND stats_cah.user_id=?";
    } else {
        sql += " ORDER BY stats_cah.points DESC LIMIT 25";
    }

    con.query(sql, [guild, player], (err, result) => {
        if(err) console.error(err),process.exit();
        _callback(result);
    });
}

function setStats_cah(guild, player, points){
    getStats_cah(guild, player, (result) => {
        if(result.length){
            con.query("UPDATE stats_cah SET `points`=`points`+? WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?) AND `user_id`=?", [points, guild, player], (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Update stats_cah");
            });
        } else {
            con.query("INSERT INTO stats_cah SELECT guilds.guild_id, ?, ? FROM guilds WHERE guilds.guild = ?", [player, points, guild], (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Insert stats_cah");
            });
        }
    });
}

function getStats_guild(guild, type, _callback){
    con.query("SELECT guilds.guild, stats_guild.type, stats_guild.timestamp, stats_guild.value FROM stats_guild INNER JOIN guilds ON guilds.guild_id=stats_guild.guild_id WHERE guilds.guild=? AND stats_guild.type=? ORDER BY timestamp ASC", [guild, type], (err, result) => {
        if(err) console.error(err),process.exit();
        _callback(result);
    });
}

function setStats_guild(guild, type, value){
    let timestamp = Date.now().toString();
    con.query("INSERT INTO stats_guild SELECT guilds.guild_id, ?, ?, ? FROM guilds WHERE guilds.guild=?", [type, timestamp, value, guild], (err, result) => {
        if(err) console.error(err),process.exit();
        console.log(type);
    });
}

function getStats_bot(stat, _callback){
    con.query("SELECT value FROM stats_bot WHERE stat=?", [stat], (err, result) => {
        if(err) console.error(err),process.exit();
        _callback(result);
    });
}

function setStats_bot(stat, value){
    con.query("UPDATE stats_bot SET value=value+? WHERE stat=?", [value, stat], (err, result) => {
        if(err) console.error(err),process.exit();
        //nothing
    });
}

function getBtc(guild, id, _callback){
    con.query("SELECT guilds.guild, btc.user_id, btc.value, btc.type FROM btc INNER JOIN guilds ON guilds.guild_id=btc.guild_id WHERE guilds.guild=? AND btc.user_id=?", (err, result) => {
        if(err) console.error(err),process.exit();
        _callback(result);
    });
}

function setBtc(guild, id, type, value){
    getBtc(guild, id, (result) => {
        if(result.length){
            con.query("UPDATE btc SET `value`=? WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?) AND `user_id`=? AND `type`=?", [value, guild, id, type], (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Insert btc")
            });
        } else {
            con.query("INSERT INTO btc SELECT guilds.guild_id, ?, ?, ? FROM guilds WHERE guilds.guild = ?", [id, value, type, guild], (err, result) => {
                if(err) console.error(err),process.exit();
                console.log("[db]Insert btc")
            });
        }
    });
}

function getStats_users(guild, id, _callback){
    let sql = "SELECT guilds.guild, stats_users.user_id, stats_users.value, stats_users.type FROM stats_users INNER JOIN guilds ON guilds.guild_id=stats_users.guild_id WHERE guilds.guild=?";
    if(id === "all"){
        sql += " ORDER BY stats_users.value DESC";
    } else {
        sql += " AND stats_users.user_id=?";
    }

    con.query(sql, [guild, id], (err, result) => {
        if(err) console.error(err),process.exit();
        _callback(result);
    });
}

function setStats_users(guild, id, type, value){
    getStats_users(guild, id, (result) => {
        if(result.length){ //need a better check if I'll be using more stats!!!
            console.log("update");
            con.query("UPDATE stats_users SET `value`=`value`+? WHERE `guild_id`=(SELECT `guild_id` FROM guilds WHERE `guild`=?) AND `user_id`=? AND `type`=?", [value, guild, id, type], (err, result) => {
                if(err) console.error(err),process.exit();
            });
        } else {
            con.query("INSERT INTO stats_users SELECT guilds.guild_id, ?, ?, ? FROM guilds WHERE guilds.guild = ?", [id, value, type, guild], (err, result) => {
                if(err) console.error(err),process.exit();
            });
        }
    });
}

function getModlog(guild, id, _callback){
    con.query("SELECT modlog.id, guilds.guild, modlog.user, modlog.type, modlog.mod, modlog.timestamp, modlog.reason, modlog.time FROM modlog INNER JOIN guilds ON guilds.guild_id=modlog.guild_id WHERE guilds.guild=? AND modlog.user=?", [guild, id], (err, result) => {
        if(err) console.error(err),process.exit();
        _callback(result);
    });
}

function setModlog(guild, data){
    con.query("SELECT * FROM guilds WHERE `guild`=?", [guild], (err, result) => {
        if(err) console.error(err),process.exit();
        if(result.length){
            data.guild_id = result[0].guild_id;
            con.query(`INSERT INTO modlog SET ?`, data, (err, result) => {
                if(err) console.error(err),process.exit();
            });
        }
    });

}

function executeStatement(statement, opts, _callback){
    con.query(statement, [opts], (err, result) => {
        if(err) console.error(err),process.exit();
        _callback(result);
        console.log("[db]Number of records inserted: " + result.affectedRows);
    });
}

function close(){
    con.destroy();
}

module.exports = {
    con: con,
    executeStatement: executeStatement,
    setup: setup,
    addGuild: addGuild,
    deleteGuild: deleteGuild,
    rebuildGuild: rebuildGuild,
    deleteTable: deleteTable,
    rebuildTable: rebuildTable,
    resetDatabase: resetDatabase,
    getPermissions: getPermissions,
    setPermissions: setPermissions,
    getSettings: getSettings,
    setSettings: setSettings,
    getStats_cah: getStats_cah,
    setStats_cah: setStats_cah,
    getServerStats: getStats_guild,
    setServerStats: setStats_guild,
    getBotStats: getStats_bot,
    setBotStats: setStats_bot,
    setBtc: setBtc,
    getBtc, getBtc,
    getStats: getStats_users,
    setStats: setStats_users,
    getModlog: getModlog,
    setModlog: setModlog,
    close: close
};
