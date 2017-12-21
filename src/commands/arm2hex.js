module.exports = {
    name: "arm2hex",
    description: "arm2hex",
    defaultPermission: 1,
    usage: "<ADD X12 X11 X23 | CBZ X16 #24>",
    args: 1,
    execute(self, msg){
        message = self.createEmbed("info", createHex(msg.params.join(" ")));
    	self.send(msg, message);
    }
};

// let str = `B #24
// NOP
// NOP
// NOP
// NOP
// ADD X2 X16 X18
// BL #8
// NOP
// ADD X2 X16 X18`;
//
// str = `SUB X16 X16 X18
// CBZ X16 #24
// SUB X16 X16 X18
// CBZ X16 #16
// ADD X16 X16 X18
// NOP
// ADD X16 X16 X2
// SUB X16 X16 #80
// CBNZ X16 #24`;
//
// str = `LDUR X2 X16 #0
// CBZ X16 #24
// STUR X18 X16 #0
// STUR X18 X16 #2`;
//
// str = `ADD X2 X16 X18
// SUB X2 X16 X18
// AND X2 X16 X18
// ORR X2 X16 X18
// EOR X2 X16 X18
// LSL X2 X16 X18
// LSR X2 X16 X18
// BR X17`;

const opcode = {
    "add": {
        opc: "10001011000",
        type: "R",
        width: 11,
        info: "R[Rd] = R[Rn] + R[Rm]",
        params: ["Rd", "Rn", "Rm"]
    },
    "sub": {
        opc: "11001011000",
        type: "R",
        width: 11,
        info: "R[Rd] = R[Rn] - R[Rm]",
        params: ["Rd", "Rn", "Rm"]
    },
    "and": {
        opc: "10001010000",
        type: "R",
        width: 11,
        info: "R[Rd] = R[Rn] & R[Rm]",
        params: ["Rd", "Rn", "Rm"]
    },
    "orr": {
        opc: "10101010000",
        type: "R",
        width: 11,
        info: "R[Rd] = R[Rn]|R[Rm]",
        params: ["Rd", "Rn", "Rm"]
    },
    "eor": {
        opc: "11001010000",
        type: "R",
        width: 11,
        info: "R[Rd] = R[Rn] ^R[Rm]",
        params: ["Rd", "Rn", "Rm"]
    },
    "lsl": {
        opc: "11010011011",
        type: "R",
        width: 11,
        info: "R[Rd] = R[Rn] << shamt",
        params: ["Rd", "Rn", "shamt"]
    },
    "lsr": {
        opc: "11010011010",
        type: "R",
        width: 11,
        info: "R[Rd] = R[Rn] >>> shamt",
        params: ["Rd", "Rn", "shamt"]
    },
    "ldur": {
        opc: "11111000010",
        type: "D",
        width: 11,
        info: "R[Rt] = M[R[Rn] + DTAddr]",
        params: ["Rt", "Rn", "DTAddr"]
    },
    "stur": {
        opc: "11111000000",
        type: "D",
        width: 11,
        info: "M[R[Rn] + DTAddr] = R[Rt]",
        params: ["Rt", "Rn", "DTAddr"]

    },
    "cbz": {
        opc: "10110100",
        type: "CB",
        width: 8,
        info: "if(R[Rt]==0) PC = PC + CondBranchAddr",
        params: ["Rt", "CondBranchAddr"]
    },
    "cbnz": {
        opc: "10110101",
        type: "CB",
        width: 8,
        info: "if(R[Rt]!=0) PC = PC + CondBranchAddr",
        params: ["Rt", "CondBranchAddr"]
    },
    "b": {
        opc: "000101",
        type: "B",
        width: 6,
        info: "PC = PC + BranchAddr",
        params: ["BranchAddr"]
    },
    "bl": {
        opc: "100101",
        type: "B",
        width: 6,
        info: "PC = PC + BranchAddr",
        params: ["BranchAddr"]
    },
    "br": {
        opc: "11010110000",
        type: "R",
        width: 11,
        info: "PC = R[Rn]",
        params: ["Rn"]
    },
};
const types = {
    "R":{
        order: ["opcode", "rm", "shamt", "rn", "rd"],
        params: {
            "opcode": {
                width: 11
            },
            "rm": {
                width: 5
            },
            "shamt": {
                width: 6
            },
            "rn": {
                width: 5
            },
            "rd":{
                width: 5
            }
        }
    },
    "D":{
        order: ["opcode", "dtaddr","op", "rn", "rt"],
        params: {
            "opcode": {
                width: 11
            },
            "dtaddr": {
                width: 9
            },
            "op": {
                width: 2
            },
            "rn": {
                width: 5
            },
            "rt": {
                width: 5
            }
        }
    },
    "CB":{
        order: ["opcode", "condbranchaddr", "rt"],
        params: {
            "opcode": {
                width: 8
            },
            "condbranchaddr": {
                width: 19
            },
            "rt": {
                width: 5
            }
        }
    },
    "B":{
        order: ["opcode", "branchaddr"],
        params: {
            "opcode": {
                width: 6
            },
            "branchaddr": {
                width: 26
            }
        }
    }
}

// console.log(createHex(str));

function createHex(input){
    let compiled = [];

    input = input.split("\n").map(x => x.split(" "));

    for(let i = 0; i < input.length; i++){
        let params = input[i];
        let instr = params.shift().toLowerCase();

        if(instr == "nop") {
            compiled.push(formatToBin(32, "NONE"));
            continue;
        }
        if(opcode[instr].params.length != params.length){
            return (`line:${i} not enough parameters - ${instr} ${opcode[instr].params.join(" ")} - ${opcode[instr].info}`);
            break;
        }

        let instruction = opcode[instr];

        let format = types[instruction.type];

        let binInstr = format.order.map((p) => {
            if(p == "opcode"){
                return instruction.opc;
            } else if (instruction.params.map(x => x.toLowerCase()).includes(p)){
                let index = instruction.params.map(x => x.toLowerCase()).indexOf(p);
                let value = params[index];
                return formatToBin(format.params[p].width, value);
            } else {
                return formatToBin(format.params[p].width, "NONE");
            }

        }).join("");

        compiled.push(binInstr);
    }
    return compiled.map((x) => {
        let hex = parseInt(x, 2).toString(16);
        while (hex.length < 8) {
            hex = "0" + hex;
        }
        return hex;
    }).join("\n");
}

function formatToBin(length, value){
    if(value[0] == "X"){
        value = value.slice(1);
        value = parseInt(value).toString(2);
        while(value.length < length){
            value = "0" + value;
        }
        return value;
    } else if(value[0] == "#"){
        value = value.slice(1);
        value = parseInt(value).toString(2);
        while(value.length < length){
            value = "0" + value;
        }
        return value;
    } else {
        value = "";
        while(value.length < length){
            value = "0" + value;
        }
        return value;
    }

}
