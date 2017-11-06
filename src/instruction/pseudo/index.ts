
import { byte } from "../../utility";
import { parseComponents } from "../util";
import { InstructionComponentPattern as CPattern, REG, IMM, LABEL, PSEUDOADDR, PseudoAddr } from "../pattern";

export function pseudoCodeRepl(code: string): PseudoReplResult {
    code = code.trim();
    const splitter = code.indexOf(" ");
    const cmd = splitter === -1 ? code : code.slice(0, splitter);
    const handler = pseduCodeMap.get(cmd);
    return handler ? handler(code.slice(splitter + 1).trim()) : { success: true, native: true, code: [code] };
}

export interface PseudoReplResult {
    success: boolean;
    native?: boolean;
    errmsg?: string;
    code?: string[] | PseudoCodePostProcess;
}

export interface PseudoCodePostProcess {
    count: number;
    label: string;
    process: (labelAddr: number) => string[];
}

const pseduCodeMap = new Map<string, (components: string) => PseudoReplResult>();

// abs $d, $s
function abs(components: string) {
    return processComponents<[REG, REG]>(components, [CPattern.REG, CPattern.REG], (comps: [REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        return [
            `addu ${reg_d}, $r0, ${reg_s}`,
            `bgez ${reg_s}, 8`,
            `sub ${reg_d}, $r0, ${reg_s}` // this may overflow
        ];
    });
}
pseduCodeMap.set("abs", abs);

// div(u) $d, $s, $t
function divGen(command: string) {
    return (components: string) => {
        return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
            const reg_d = "$" + comps[0].regName;
            const reg_s = "$" + comps[1].regName;
            const reg_t = "$" + comps[2].regName;
            return [
                `bne ${reg_t}, $r0, 8`,
                `break`,
                `${command} ${reg_s}, ${reg_t}`,
                `mflo ${reg_d}`
            ];
        }, `${command} ${components}`);
    };
}
pseduCodeMap.set("div", divGen("div"));
pseduCodeMap.set("divu", divGen("divu"));

// mul $d, $s, $t
function mul(components: string) {
    return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `mult ${reg_s}, ${reg_t}`,
            `mflo ${reg_d}`
        ];
    });
}
pseduCodeMap.set("mul", mul);

// mulo $d, $s, $t
function mulo(components: string) {
    return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `mult ${reg_s}, ${reg_t}`,
            `mfhi $at`,
            `mflo ${reg_d}`,
            `sra ${reg_d}, ${reg_d}, 31`,
            `beq $at, ${reg_d}, 8`,
            `break`,
            `mflo ${reg_d}`,
        ];
    });
}
pseduCodeMap.set("mulo", mulo);

// neg(u) $d, $s
function negGen(command: string) {
    return (components: string) => {
        return processComponents<[REG, REG]>(components, [CPattern.REG, CPattern.REG], (comps: [REG, REG]) => {
            const reg_d = "$" + comps[0].regName;
            const reg_s = "$" + comps[1].regName;
            return [
                `${command} ${reg_d}, $r0, ${reg_s}`
            ];
        });
    };
}
pseduCodeMap.set("neg", negGen("sub"));
pseduCodeMap.set("negu", negGen("subu"));

// not $d, $s
function not(components: string) {
    return processComponents<[REG, REG]>(components, [CPattern.REG, CPattern.REG], (comps: [REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        return [
            `xor ${reg_d}, ${reg_s}, $r0`
        ];
    });
}
pseduCodeMap.set("not", not);

// rem(u) $d, $s, $t
function remGen(command: string) {
    return (components: string) => {
        return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
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
    };
}
pseduCodeMap.set("rem", remGen("div"));
pseduCodeMap.set("remu", remGen("divu"));

// rol $d, $s, $t
function rol(components: string) {
    return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
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
}
pseduCodeMap.set("rol", rol);

// rol $d, $s, $t
function ror(components: string) {
    return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
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
}
pseduCodeMap.set("ror", ror);

// seq $d, $s, $t
function seq(components: string) {
    return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
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
}
pseduCodeMap.set("seq", seq);

// sne $d, $s, $t
function sne(components: string) {
    return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
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
}
pseduCodeMap.set("sne", sne);

// sge(u) $d, $s, $t
function sgeGen(command: string) {
    return (components: string) => {
        return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
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
    };
}
pseduCodeMap.set("sge", sgeGen("slt"));
pseduCodeMap.set("sgeu", sgeGen("sltu"));

// sgt(u) $d, $s, $t
function sgtGen(command: string) {
    return (components: string) => {
        return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
            const reg_d = "$" + comps[0].regName;
            const reg_s = "$" + comps[1].regName;
            const reg_t = "$" + comps[2].regName;
            return [
                `${command} ${reg_d}, ${reg_t}, ${reg_s}`
            ];
        });
    };
}
pseduCodeMap.set("sgt", sgtGen("slt"));
pseduCodeMap.set("sgtu", sgtGen("sltu"));

// sle(u) $d, $s, $t
function sleGen(command: string) {
    return (components: string) => {
        return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
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
    };
}
pseduCodeMap.set("sle", sleGen("slt"));
pseduCodeMap.set("sleu", sleGen("sltu"));

// bge(u) $s, $t, label
function bgeGen(command: string) {
    return (components: string) => {
        return processComponents<[REG, REG, LABEL]>(components, [CPattern.REG, CPattern.REG, CPattern.LABEL], (comps: [REG, REG, LABEL]) => {
            const reg_s = "$" + comps[0].regName;
            const reg_t = "$" + comps[1].regName;
            const label = comps[2];
            return [
                `${command} $at, ${reg_s}, ${reg_t}`,
                `beq $at, $r0, ${label}`
            ];
        });
    };
}
pseduCodeMap.set("bge", bgeGen("slt"));
pseduCodeMap.set("bgeu", bgeGen("sltu"));

// bgt(u) $s, $t, label
function bgtGen(command: string) {
    return (components: string) => {
        return processComponents<[REG, REG, LABEL]>(components, [CPattern.REG, CPattern.REG, CPattern.LABEL], (comps: [REG, REG, LABEL]) => {
            const reg_s = "$" + comps[0].regName;
            const reg_t = "$" + comps[1].regName;
            const label = comps[2];
            return [
                `${command} $at, ${reg_t}, ${reg_s}`,
                `bne $at, $r0, ${label}`
            ];
        });
    };
}
pseduCodeMap.set("bgt", bgtGen("slt"));
pseduCodeMap.set("bgtu", bgtGen("sltu"));

// ble(u) $s, $t, label
function bleGen(command: string) {
    return (components: string) => {
        return processComponents<[REG, REG, LABEL]>(components, [CPattern.REG, CPattern.REG, CPattern.LABEL], (comps: [REG, REG, LABEL]) => {
            const reg_s = "$" + comps[0].regName;
            const reg_t = "$" + comps[1].regName;
            const label = comps[2];
            return [
                `${command} $at, ${reg_t}, ${reg_s}`,
                `beq $at, $r0, ${label}`
            ];
        });
    };
}
pseduCodeMap.set("ble", bleGen("slt"));
pseduCodeMap.set("bleu", bleGen("sltu"));

// blt(u) $s, $t, label
function bltGen(command: string) {
    return (components: string) => {
        return processComponents<[REG, REG, LABEL]>(components, [CPattern.REG, CPattern.REG, CPattern.LABEL], (comps: [REG, REG, LABEL]) => {
            const reg_s = "$" + comps[0].regName;
            const reg_t = "$" + comps[1].regName;
            const label = comps[2];
            return [
                `${command} $at, ${reg_s}, ${reg_t}`,
                `bne $at, $r0, ${label}`
            ];
        });
    };
}
pseduCodeMap.set("blt", bltGen("slt"));
pseduCodeMap.set("bltu", bltGen("sltu"));

// beqz $s, label
function beqz(components: string) {
    return processComponents<[REG, LABEL]>(components, [CPattern.REG, CPattern.LABEL], (comps: [REG, LABEL]) => {
        const reg_s = "$" + comps[0].regName;
        const label = comps[1];
        return [
            `beq ${reg_s}, $r0, ${label}`
        ];
    });
};
pseduCodeMap.set("beqz", beqz);

// bnez $s, label
function bnez(components: string) {
    return processComponents<[REG, LABEL]>(components, [CPattern.REG, CPattern.LABEL], (comps: [REG, LABEL]) => {
        const reg_s = "$" + comps[0].regName;
        const label = comps[1];
        return [
            `bne ${reg_s}, $r0, ${label}`
        ];
    });
};
pseduCodeMap.set("bnez", bnez);

// la $t0, addr
function la(components: string) {
    return processComponents<[REG, PSEUDOADDR]>(components, [CPattern.REG, CPattern.PSEUDOADDR], (comps: [REG, PSEUDOADDR]) => {
        const reg_s = "$" + comps[0].regName;
        const addr = comps[1];
        if (addr.type === PseudoAddr.CONST) {
            // same as 
            // li $t0, imm
            return li(components).code;
        } else if (addr.type === PseudoAddr.CONST_REG || addr.type === PseudoAddr.REG) {
            return [
                `addi ${reg_s}, $${addr.regName}, ${addr.num || 0}`
            ];
        } else if (addr.type === PseudoAddr.LABEL || addr.type === PseudoAddr.LABEL_CONST) {
            return <PseudoCodePostProcess>{
                count: 2,
                label: addr.label,
                process: (labelAddr: number) => {
                    const finalNum = labelAddr + addr.num;
                    return [
                        `lui $at, ${finalNum >> 16}`,
                        `ori ${reg_s}, $at, ${finalNum & maxNum16bits}`
                    ];
                }
            }
        } else {
            // LABEL + CONST (REG)
            return <PseudoCodePostProcess>{
                count: 3,
                label: addr.label,
                process: (labelAddr: number) => {
                    const finalNum = labelAddr + addr.num;
                    return [
                        `lui $at, ${finalNum >> 16}`,
                        `ori ${reg_s}, $at, ${finalNum & maxNum16bits}`,
                        `add ${reg_s}, $${addr.regName}, $at`
                    ];
                }
            }
        }
    });
};
pseduCodeMap.set("la", la);

// li $d, imm
// li $d, large num =>
//    lui $d, high(large num)
//    ori $d, $d, low(large num)
// li $d, small num =>
//    ori $d, $r0, num
function li(components: string) {
    return processComponents<[REG, IMM]>(components, [CPattern.REG, CPattern.IMM], (comps: [REG, IMM]) => {
        const reg_s = "$" + comps[0].regName;
        const numBits = byte.bitsNumFill(byte.numToBits(comps[1].num), 32, true);
        const high = byte.bitsToNum(numBits.slice(0, 16), true);
        const low = byte.bitsToNum(numBits.slice(16), true);
        const loadHigh = high ? [`lui ${reg_s}, ${high}`] : [];
        return loadHigh.concat(`ori ${reg_s}, ${high ? reg_s : "$r0"}, ${low}`);
    });
}
pseduCodeMap.set("li", li);

// move $d, $s
function move(components: string) {
    return processComponents<[REG, REG]>(components, [CPattern.REG, CPattern.REG], (comps: [REG, REG]) => {
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        return [
            `addu ${reg_d}, $r0, ${reg_s}`
        ];
    });
}
pseduCodeMap.set("move", move);

// TODO
// ulh(u)
// ulw
// ush
// usw

const maxNum16bits = (1 << 16) - 1;

function processComponents<T extends (REG | IMM | LABEL | PSEUDOADDR)[]>(components: string, pattern: CPattern[], processor: (comps: T) => string[] | PseudoCodePostProcess, fallback?: string): PseudoReplResult {
    const compsResult = parseComponents<T>(components, pattern);
    if (compsResult.success) {
        return {
            success: true,
            code: processor(compsResult.result)
        };
    } else if (fallback) {
        return {
            success: true,
            code: [fallback]
        };
    } else {
        return {
            success: false,
            errmsg: compsResult.errmsg
        };
    }
}
