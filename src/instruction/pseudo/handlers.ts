
import { byte } from "../../utility";
import { parseComponents } from "../util";
import { InstructionComponentPattern as CPattern, REG, IMM, LABEL, PSEUDOADDR, PseudoAddr } from "../pattern";
import { MIPSError, SyntaxErrorCode } from "../../error";

export interface Handler {
    getCount(comp: string): number;
    conv(comp: string, labelMap: Map<string, number>): string[];
}

export function getHandler(cmd: string): Handler {
    return map.get(cmd.trim().toLowerCase());
}

const map = new Map<string, Handler>();

// abs $d, $s
const abs = genConstHandler(3, (comp: string) => {
    return processComponents<[REG, REG]>(comp, [CPattern.REG, CPattern.REG], (comps: [REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        return [
            `addu ${reg_d}, $r0, ${reg_s}`,
            `bgez ${reg_s}, 8`,
            `sub ${reg_d}, $r0, ${reg_s}` // this may overflow
        ];
    });
})
map.set("abs", abs);

// add(u) $d, $s, $t|imm -> addi(u) $d, $s, imm
function addGen(command: string, commandi: string, neg?: boolean): Handler {
    return genConstHandler(1, (comp: string) => {
        const comps = parseComponents<[REG, REG, IMM | REG]>(comp, [CPattern.REG, CPattern.REG, CPattern.IMM | CPattern.REG]);
        const lastComp = comps[2];
        if ("num" in lastComp) {
            return [`${commandi} $${comps[0].regName}, $${comps[1].regName}, ${(<IMM>lastComp).num * (neg ? -1 : 1)}`]
        } else {
            return [`${command} ${comp}`]; // fall back to original instruction
        }
    });
}
map.set("add", addGen("add", "addi"));
map.set("addu", addGen("addu", "addiu"));
map.set("sub", addGen("sub", "addi", true));
map.set("subu", addGen("subu", "addiu", true));

// div(u) $d, $s, $t
function divGen(command: string): Handler {
    return {
        getCount: (comp: string) => {
            try {
                parseComp3Reg(comp);
                return 4;
            }
            catch (err) {
                return 1;
            }
        },
        conv: (comp: string): string[] => {
            try {
                const comps = parseComp3Reg(comp);
                const reg_d = "$" + comps[0].regName;
                const reg_s = "$" + comps[1].regName;
                const reg_t = "$" + comps[2].regName;
                return [
                    `bne ${reg_t}, $r0, 8`,
                    `break`,
                    `${command} ${reg_s}, ${reg_t}`,
                    `mflo ${reg_d}`
                ];
            }
            catch (err) {
                return [`${command} ${comp}`]; // fall back to original instruction
            }
        }
    }
}
map.set("div", divGen("div"));
map.set("divu", divGen("divu"));

// mul $d, $s, $t
const mul = genConstHandler(2, (comp: string) => {
    return processComponents<[REG, REG, REG]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `mult ${reg_s}, ${reg_t}`,
            `mflo ${reg_d}`
        ];
    });
});
map.set("mul", mul);

// mulo $d, $s, $t
const mulo = {
    getCount: (comp: string) => {
        const comps = parseComponents<[REG, REG, REG | IMM]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG | CPattern.IMM]);
        const lastComp = comps[2];
        return 7 + ("num" in lastComp ? li.getCount("$at, " + (<IMM>lastComp).num) : 0);
    },
    conv: (comp: string): string[] => {
        return processComponents<[REG, REG, REG | IMM]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG | CPattern.IMM], (comps: [REG, REG, REG | IMM]) => {
            const reg_d = "$" + comps[0].regName;
            const reg_s = "$" + comps[1].regName;
            const lastComp = comps[2];
            let reg_t: string;
            let ret: string[];
            if ("num" in lastComp) {
                reg_t = "$at";
                ret = li.conv("$at, " + (<IMM>lastComp).num, null);
            } else {
                reg_t = "$" + (<REG>lastComp).regName;
                ret = [];
            }
            return ret.concat([
                `mult ${reg_s}, ${reg_t}`,
                `mfhi $at`,
                `mflo ${reg_d}`,
                `sra ${reg_d}, ${reg_d}, 31`,
                `beq $at, ${reg_d}, 8`,
                `break`,
                `mflo ${reg_d}`,
            ]);
        });
    }
};
map.set("mulo", mulo);

// neg(u) $d, $s
function negGen(command: string) {
    return genConstHandler(1, (comp: string) => {
        return processComponents<[REG, REG]>(comp, [CPattern.REG, CPattern.REG], (comps: [REG, REG]) => {
            const reg_d = "$" + comps[0].regName;
            const reg_s = "$" + comps[1].regName;
            return [
                `${command} ${reg_d}, $r0, ${reg_s}`
            ];
        });
    });
}
map.set("neg", negGen("sub"));
map.set("negu", negGen("subu"));

// not $d, $s
const not = genConstHandler(1, (comp: string) => {
    return processComponents<[REG, REG]>(comp, [CPattern.REG, CPattern.REG], (comps: [REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        return [
            `xor ${reg_d}, ${reg_s}, $r0`
        ];
    });
});
map.set("not", not);

// rem(u) $d, $s, $t
function remGen(command: string) {
    return genConstHandler(4, (comp: string) => {
        return processComponents<[REG, REG, REG]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
            const reg_d = "$" + comps[0].regName;
            const reg_s = "$" + comps[1].regName;
            const reg_t = "$" + comps[2].regName;
            return [
                `bne ${reg_t}, $r0, 8`,
                `break`,
                `${command} ${reg_s}, ${reg_t}`,
                `mfhi ${reg_d}`
            ];
        });
    });
}
map.set("rem", remGen("div"));
map.set("remu", remGen("divu"));

// rol $d, $s, $t
const rol = genConstHandler(4, (comp: string) => {
    return processComponents<[REG, REG, REG]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `subu $at, $r0, ${reg_t}`,
            `srlv $at, ${reg_s}, $at`,
            `sllv ${reg_d}, ${reg_s}, ${reg_t}`,
            `or ${reg_d}, ${reg_d}, $at`
        ];
    });
});
map.set("rol", rol);

// rol $d, $s, $t
const ror = genConstHandler(4, (comp: string) => {
    return processComponents<[REG, REG, REG]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `subu $at, $r0, ${reg_t}`,
            `sllv $at, ${reg_s}, $at`,
            `srlv ${reg_d}, ${reg_s}, ${reg_t}`,
            `or ${reg_d}, ${reg_d}, $at`
        ];
    });
});
map.set("ror", ror);

// seq $d, $s, $t
const seq = genConstHandler(4, (comp: string) => {
    return processComponents<[REG, REG, REG]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `beq ${reg_t}, ${reg_s}, 12`,
            `ori ${reg_d}, $r0, 0`,
            `beq $r0, $r0, 8`,
            `ori ${reg_d}, $r0, 1`
        ];
    });
});
map.set("seq", seq);

// sne $d, $s, $t
const sne = genConstHandler(4, (comp: string) => {
    return processComponents<[REG, REG, REG]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `beq ${reg_t}, ${reg_s}, 12`,
            `ori ${reg_d}, $r0, 1`,
            `beq $r0, $r0, 8`,
            `ori ${reg_d}, $r0, 0`
        ];
    });
});
map.set("sne", sne);

// sge(u) $d, $s, $t
function sgeGen(command: string) {
    return genConstHandler(4, (comp: string) => {
        return processComponents<[REG, REG, REG]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
            const reg_d = "$" + comps[0].regName;
            const reg_s = "$" + comps[1].regName;
            const reg_t = "$" + comps[2].regName;
            return [
                `bne ${reg_t}, ${reg_s}, 12`,
                `ori ${reg_d}, $r0, 1`,
                `beq $r0, $r0, 8`,
                `${command} ${reg_d}, ${reg_t}, ${reg_s}`
            ];
        });
    });
}
map.set("sge", sgeGen("slt"));
map.set("sgeu", sgeGen("sltu"));

// sgt(u) $d, $s, $t
function sgtGen(command: string) {
    return genConstHandler(1, (comp: string) => {
        return processComponents<[REG, REG, REG]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
            const reg_d = "$" + comps[0].regName;
            const reg_s = "$" + comps[1].regName;
            const reg_t = "$" + comps[2].regName;
            return [
                `${command} ${reg_d}, ${reg_t}, ${reg_s}`
            ];
        });
    });
}
map.set("sgt", sgtGen("slt"));
map.set("sgtu", sgtGen("sltu"));

// sle(u) $d, $s, $t
function sleGen(command: string) {
    return genConstHandler(4, (comp: string) => {
        return processComponents<[REG, REG, REG]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
            const reg_d = "$" + comps[0].regName;
            const reg_s = "$" + comps[1].regName;
            const reg_t = "$" + comps[2].regName;
            return [
                `bne ${reg_t}, ${reg_s}, 12`,
                `ori ${reg_d}, $r0, 1`,
                `beq $r0, $r0, 8`,
                `${command} ${reg_d}, ${reg_s}, ${reg_t}`
            ];
        });
    });
}
map.set("sle", sleGen("slt"));
map.set("sleu", sleGen("sltu"));

// bge(u) $s, $t, label
function bgeGen(command: string) {
    return genConstHandler(2, (comp: string) => {
        return processComponents<[REG, REG, LABEL]>(comp, [CPattern.REG, CPattern.REG, CPattern.LABEL], (comps: [REG, REG, LABEL]) => {
            const reg_s = "$" + comps[0].regName;
            const reg_t = "$" + comps[1].regName;
            const label = comps[2];
            return [
                `${command} $at, ${reg_s}, ${reg_t}`,
                `beq $at, $r0, ${label}`
            ];
        });
    });
}
map.set("bge", bgeGen("slt"));
map.set("bgeu", bgeGen("sltu"));

// bgt(u) $s, $t, label
function bgtGen(command: string) {
    return genConstHandler(2, (comp: string) => {
        return processComponents<[REG, REG, LABEL]>(comp, [CPattern.REG, CPattern.REG, CPattern.LABEL], (comps: [REG, REG, LABEL]) => {
            const reg_s = "$" + comps[0].regName;
            const reg_t = "$" + comps[1].regName;
            const label = comps[2];
            return [
                `${command} $at, ${reg_t}, ${reg_s}`,
                `bne $at, $r0, ${label}`
            ];
        });
    });
}
map.set("bgt", bgtGen("slt"));
map.set("bgtu", bgtGen("sltu"));

// ble(u) $s, $t, label
function bleGen(command: string) {
    return genConstHandler(2, (comp: string) => {
        return processComponents<[REG, REG, LABEL]>(comp, [CPattern.REG, CPattern.REG, CPattern.LABEL], (comps: [REG, REG, LABEL]) => {
            const reg_s = "$" + comps[0].regName;
            const reg_t = "$" + comps[1].regName;
            const label = comps[2];
            return [
                `${command} $at, ${reg_t}, ${reg_s}`,
                `beq $at, $r0, ${label}`
            ];
        });
    });
}
map.set("ble", bleGen("slt"));
map.set("bleu", bleGen("sltu"));

// blt(u) $s, $t, label
function bltGen(command: string) {
    return genConstHandler(2, (comp: string) => {
        return processComponents<[REG, REG, LABEL]>(comp, [CPattern.REG, CPattern.REG, CPattern.LABEL], (comps: [REG, REG, LABEL]) => {
            const reg_s = "$" + comps[0].regName;
            const reg_t = "$" + comps[1].regName;
            const label = comps[2];
            return [
                `${command} $at, ${reg_s}, ${reg_t}`,
                `bne $at, $r0, ${label}`
            ];
        });
    });
}
map.set("blt", bltGen("slt"));
map.set("bltu", bltGen("sltu"));

// beqz $s, label
const beqz = genConstHandler(1, (comp: string) => {
    return processComponents<[REG, LABEL]>(comp, [CPattern.REG, CPattern.LABEL], (comps: [REG, LABEL]) => {
        const reg_s = "$" + comps[0].regName;
        const label = comps[1];
        return [
            `beq ${reg_s}, $r0, ${label}`
        ];
    });
});
map.set("beqz", beqz);

// bnez $s, label
const bnez = genConstHandler(1, (components: string) => {
    return processComponents<[REG, LABEL]>(components, [CPattern.REG, CPattern.LABEL], (comps: [REG, LABEL]) => {
        const reg_s = "$" + comps[0].regName;
        const label = comps[1];
        return [
            `bne ${reg_s}, $r0, ${label}`
        ];
    });
});
map.set("bnez", bnez);

// la $t0, addr
const la: Handler = {
    getCount: (comp: string) => {
        const laComp = parseLAComp(comp);
        const addr = laComp[1];
        if (addr.type === PseudoAddr.CONST) {
            return li.getCount(comp);
        } else if (addr.type === PseudoAddr.CONST_REG || addr.type === PseudoAddr.REG) {
            return byte.numToBits(addr.num || 0).result.length > 16 ? (li.getCount(`$at, ${addr.num}`) + 1) : 1;
        } else if (addr.type === PseudoAddr.LABEL || addr.type === PseudoAddr.LABEL_CONST) {
            return 2;
        } else {
            return 3;
        }
    },
    conv: (comp: string, labelMap: Map<string, number>) => {
        const laComp = parseLAComp(comp);
        const reg_s = "$" + laComp[0].regName;
        const addr = laComp[1];
        if (addr.type === PseudoAddr.CONST) {
            return li.conv(comp, labelMap);
        } else if (addr.type === PseudoAddr.CONST_REG || addr.type === PseudoAddr.REG) {
            const num = addr.num || 0;
            const numBits = byte.numToBits(num).result;
            if (numBits.length > 16) {
                // long IMM
                return li.conv(`$at, ${num}`, labelMap).concat(`add ${reg_s}, $${addr.regName}, $at`);
            } else {
                // short IMM
                return [`addi ${reg_s}, $${addr.regName}, ${num}`];
            }
        } else {
            if (!labelMap.has(addr.label)) {
                throw new MIPSError(`label not found: ${addr.label}`, SyntaxErrorCode.LABEL_NOT_FOUND);
            }
            const labelAddr = labelMap.get(addr.label);
            if (addr.type === PseudoAddr.LABEL || addr.type === PseudoAddr.LABEL_CONST) {
                const finalNum = labelAddr + (addr.num || 0);
                return [
                    `lui $at, ${finalNum >> 16}`,
                    `ori ${reg_s}, $at, ${finalNum & maxNum16bits}`
                ];
            } else {
                // LABEL + CONST (REG)
                const finalNum = labelAddr + addr.num;
                return [
                    `lui $at, ${finalNum >> 16}`,
                    `ori $at, $at, ${finalNum & maxNum16bits}`,
                    `add ${reg_s}, $${addr.regName}, $at`
                ];
            }
        }
    }
}
map.set("la", la);

// li $d, imm
// li $d, large num =>
//    lui $d, high(large num)
//    ori $d, $d, low(large num)
// li $d, small num =>
//    ori $d, $r0, num
const li: Handler = {
    getCount: (comp: string) => {
        return parseLIComp(comp).high ? 2 : 1;
    },
    conv: (comp: string) => {
        const liComp = parseLIComp(comp);
        const loadHigh = liComp.high ? [`lui ${liComp.reg_s}, ${liComp.high}`] : [];
        return loadHigh.concat(`ori ${liComp.reg_s}, ${liComp.high ? liComp.reg_s : "$r0"}, ${liComp.low}`);
    }
}
map.set("li", li);

// move $d, $s
const move = genConstHandler(1, (comp: string) => {
    return processComponents<[REG, REG]>(comp, [CPattern.REG, CPattern.REG], (comps: [REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        return [
            `addu ${reg_d}, $r0, ${reg_s}`
        ];
    });
});
map.set("move", move);

// b label
const b = genConstHandler(1, (comp: string, labelMap: Map<string, number>) => {
    return processComponents<[LABEL]>(comp, [CPattern.LABEL], (comps: [LABEL]) => {
        return [
            `bgez $r0, ${comps[0]}`
        ];
    });
});
map.set("b", b);

// bal label
const bal = genConstHandler(1, (comp: string, labelMap: Map<string, number>) => {
    return processComponents<[LABEL]>(comp, [CPattern.LABEL], (comps: [LABEL]) => {
        return [
            `bgezal $r0, ${comps[0]}`
        ];
    });
});
map.set("bal", bal);

// TODO
// ulh(u)
// ulw
// ush
// usw


function parseLIComp(comp: string): {
    reg_s: string;
    high: number;
    low: number;
} {
    const comps = parseComponents<[REG, IMM]>(comp, [CPattern.REG, CPattern.IMM]);
    const { bits, err } = byte.bitsNumFill(byte.numToBits(comps[1].num).result, 32, true);
    if (err) {
        throw new MIPSError(`failed to encode the integer into 32-bits number: ${comps}`, SyntaxErrorCode.NUM_OVERFLOW);
    } else {
        return {
            reg_s: "$" + comps[0].regName,
            high: byte.bitsToNum(bits.slice(0, 16), true),
            low: byte.bitsToNum(bits.slice(16), true)
        };
    }
}

function parseLAComp(comp: string) {
    return parseComponents<[REG, PSEUDOADDR]>(comp, [CPattern.REG, CPattern.PSEUDOADDR]);
}

function genConstHandler(count: number, conv: (comp: string, labelMap: Map<string, number>) => string[]): Handler {
    return {
        getCount: () => count,
        conv: conv
    }
}

function processComponents<T extends (REG | IMM | LABEL | PSEUDOADDR)[]>(comp: string, pattern: CPattern[], processor: (comps: T) => string[]): string[] {
    return processor(parseComponents<T>(comp, pattern));
}

function parseComp3Reg(comp: string) {
    return parseComponents<[REG, REG, REG]>(comp, [CPattern.REG, CPattern.REG, CPattern.REG]);
}

const maxNum16bits = (1 << 16) - 1;
