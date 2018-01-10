module.exports = {
    name: "remindme",
    defaultPermission: 1,
    usage: "<time> 'Content to remind about within quotes'",
    args: 0,
    execute(Client, msg){
        let content = msg.params.join(" ");

        let name = content.match(/'([^']+)'/);
        let name2 = content.match(/"([^"]+)"/);

        let title;

        if(name){
            title = name[1];
            content = content.slice(0, name.index) + content.slice(name.index + name[0].length, content.length);
        } else if(name2){
            title = name2[1];
            content = content.slice(0, name2.index) + content.slice(name2.index + name2[0].length, content.length);
        } else {
            title = "";
        }

        let time = extractTime(content);

        if(time.seconds === 0){
            time =extractTimeSmarter(content);
        }

        Client.events.process(msg, "reminders.add", {
            original: time.userinput,
            name: title,
            "date-time": new Date(time.seconds*1000 + Date.now()).toISOString(),
            correctDate: true
        });
    }
};

function extractTimeSmarter(str){
    if(str.includes("tomorrow")){
        return {
            seconds: 24*60*60,
            userinput: "tomorrow"
        };
    } else {
        let date = str.match(/((\d{4})(\/|\-)(\d+)(\/|\-)(\d+))/);
        let time = str.match(/\d{1,2}\:\d{1,2}(\:\d{1,2})*/);

        let date_time = "";

        if(date || time){
            let createDate = new Date();

            if(date !== null) {
                date = date[0];
                date_time += date;
                let data = date.replace(/\/|\-/g, " ").split(" ");
                createDate.setFullYear(data[0]);
                createDate.setMonth(parseInt(data[1]) - 1);
                createDate.setDate(data[2]);
            }

            if(time !== null) {
                time = time[0];
                date_time += time;
                let data = time.split(":");
                createDate.setHours(data[0]);
                createDate.setMinutes(data[1]);
                if(data.length === 3){
                    createDate.setSeconds(data[2]);
                } else {
                    createDate.setSeconds(0);
                }
                if(date === null){
                    if(createDate().getTime() + 5000 < Date.now()){
                        createDate = new Date(createDate.getTime() + 24*60*60*1000);
                    }
                }
            }

            return {
                seconds: (createDate.getTime() - Date.now())/1000,
                userinput: "at " + date_time
            };
        }


    }

    return {
        seconds: 24*60*60,
        userinput: "1 day (default)"
    };
}

function extractTime(string){
    string = wordsToNumbers(string)

    let time = string.match(/((\d+\,*\d*)+|(\d+\,*\d*)+\.+(\d+\,*\d*)*)(\s*)([A-z]+)/g);
    if(time === null){
        return {
            seconds: 0
        };
    }

    time = time.map((str) => {
        str = str.replace(/((\d+\,*\d*)+|(\d+\,*\d*)+\.+(\d+\,*\d*)*)(\s*)([A-z]+)/g, "$1 $6");
        str = str.replace(",", "");
        return isTime(str);
    }).filter((obj) => {
        return obj.time;
    });

    let userinput = [];
    let seconds = 0;

    for(let i = 0; i < time.length; i++){
        userinput.push(time[i].original);
        seconds += time[i].seconds
    };

    return {
        userinput: "in " + userinput.join(" "),
        seconds: seconds
    };
}

function isTime(string){
    let str = string.split(" ");
    let digit = str[0];
    let word = str[1];
    let time = true;

    let seconds = 0;

    switch (word) {
        case "s":
        case "sec":
        case "secs":
        case "seconds":
        case "second":
            seconds = parseFloat(digit);
            break;
        case "m":
        case "min":
        case "mins":
        case "minute":
        case "minutes":
            seconds += 60*parseFloat(digit);
            break;
        case "h":
        case "hour":
        case "hours":
            seconds += 60*60*parseFloat(digit);
            break;
        case "d":
        case "day":
        case "days":
            seconds += 24*60*60*parseFloat(digit);
            break;
        case "w":
        case "week":
        case "weeks":
            seconds += 7*24*60*60*parseFloat(digit);
            break;
        case "month":
        case "months":
            seconds += 30*24*60*60*parseFloat(digit);
            break;
        case "y":
        case "year":
        case "years":
            seconds += 365*24*60*60*parseFloat(digit);
            break;
        default:
            time = false;
    }

    return {
        time: time,
        original: string,
        seconds: seconds,
    }
}

function wordsToNumbers(str){
    return str.replace(/\sone\s/g, " 1 ")
        .replace(/\sa\s/g, " 1 ")
        .replace(/\san\s/g, " 1 ")
        .replace(/\snext\s/g, " 1 ")
        .replace(/\stwo\s/g, " 2 ")
        .replace(/\sthree\s/g, " 3 ")
        .replace(/\sfour\s/g, " 4 ")
        .replace(/\sfive\s/g, " 5 ")
        .replace(/\ssix\s/g, " 6 ")
        .replace(/\sseven\s/g, " 7 ")
        .replace(/\seight\s/g, " 8 ")
        .replace(/\snine\s/g, " 9 ")
        .replace(/\sten\s/g, " 10 ");
}
