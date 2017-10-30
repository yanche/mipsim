
import { byte } from "../../utility";
import { parseComponents } from "../util";
import { InstructionComponentPattern as CPattern, REG, IMM, LABEL, PSEUDOADDR, PseudoAddr } from "../pattern";

export function pseudoCodeRepl(code: string): string[] | PseudoCodePostProcess {
    return [code];
}

export interface PseudoCodePostProcess {
    count: number;
    label: string;
    process: (labelAddr: number) => string[];
}

const pseduCodeMap = new Map<string, (components: string) => string[] | PseudoCodePostProcess>();

// abs $d, $s
function abs(components: string) {
    const comps = <[REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG]);
    const reg_d = "$" + comps[0].regName;
    const reg_s = "$" + comps[1].regName;
    return [
        `addu ${reg_d}, $r0, ${reg_s}`,
        `bgez ${reg_s}, 8`,
        `sub ${reg_d}, $r0, ${reg_s}`
    ];
}
pseduCodeMap.set("abs", abs);

// div(u) $d, $s, $t
function divGen(command: string) {
    return (components: string) => {
        const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `bne ${reg_t}, $r0, 8`,
            `break`,
            `${command} ${reg_s}, ${reg_t}`,
            `mflo ${reg_d}`
        ];
    };
}

pseduCodeMap.set("div", divGen("div"));
pseduCodeMap.set("divu", divGen("divu"));

// mul $d, $s, $t
function mul(components: string) {
    const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
    const reg_d = "$" + comps[0].regName;
    const reg_s = "$" + comps[1].regName;
    const reg_t = "$" + comps[2].regName;
    return [
        `mult ${reg_s}, ${reg_d}`,
        `mflo ${reg_d}`
    ];
}

// mulo $d, $s, $t
function mulo(components: string) {
    const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
    const reg_d = "$" + comps[0].regName;
    const reg_s = "$" + comps[1].regName;
    const reg_t = "$" + comps[2].regName;
    return [
        `mult ${reg_s}, ${reg_d}`,
        `mfhi $at`,
        `mflo ${reg_d}`,
        `sra ${reg_d}, ${reg_d}, 31`,
        `beq $at, ${reg_d}, 8`,
        `break`,
        `mflo ${reg_d}`,
    ];
}

// neg(u) $d, $s
function negGen(command: string) {
    return (components: string) => {
        const comps = <[REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG]);
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        return [
            `${command} ${reg_d}, $r0, ${reg_s}`
        ];
    };
}

const neg = negGen("sub");
const negu = negGen("subu");

// not $d, $s
function not(components: string) {
    const comps = <[REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG]);
    const reg_d = "$" + comps[0].regName;
    const reg_s = "$" + comps[1].regName;
    return [
        `nor ${reg_d}, ${reg_s}, $r0`
    ];
}

// rem(u) $d, $s, $t
function remGen(command: string) {
    return (components: string) => {
        const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `bne ${reg_t}, $r0, 8`,
            `break`,
            `${command} ${reg_s}, ${reg_t}`,
            `mfhi ${reg_d}`
        ];
    };
}

const rem = remGen("div");
const remu = remGen("divu");

// rol $d, $s, $t
function rol(components: string) {
    const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
    const reg_d = "$" + comps[0].regName;
    const reg_s = "$" + comps[1].regName;
    const reg_t = "$" + comps[2].regName;
    return [
        `subu $at, $r0, ${reg_t}`,
        `srlv $at, ${reg_s}, $at`,
        `sllv ${reg_d}, ${reg_s}, ${reg_t}`,
        `or ${reg_d}, ${reg_d}, $at`
    ];
}

// rol $d, $s, $t
function ror(components: string) {
    const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
    const reg_d = "$" + comps[0].regName;
    const reg_s = "$" + comps[1].regName;
    const reg_t = "$" + comps[2].regName;
    return [
        `subu $at, $r0, ${reg_t}`,
        `sllv $at, ${reg_s}, $at`,
        `srlv ${reg_d}, ${reg_s}, ${reg_t}`,
        `or ${reg_d}, ${reg_d}, $at`
    ];
}

// seq $d, $s, $t
function seq(components: string) {
    const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
    const reg_d = "$" + comps[0].regName;
    const reg_s = "$" + comps[1].regName;
    const reg_t = "$" + comps[2].regName;
    return [
        `beq ${reg_t}, ${reg_s}, 12`,
        `ori ${reg_d}, $r0, 0`,
        `beq $r0, $r0, 8`,
        `ori ${reg_d}, $r0, 1`
    ];
}

// sne $d, $s, $t
function sne(components: string) {
    const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
    const reg_d = "$" + comps[0].regName;
    const reg_s = "$" + comps[1].regName;
    const reg_t = "$" + comps[2].regName;
    return [
        `beq ${reg_t}, ${reg_s}, 12`,
        `ori ${reg_d}, $r0, 1`,
        `beq $r0, $r0, 8`,
        `ori ${reg_d}, $r0, 0`
    ];
}

// sge(u) $d, $s, $t
function sgeGen(command: string) {
    return (components: string) => {
        const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `bne ${reg_t}, ${reg_s}, 12`,
            `ori ${reg_d}, $r0, 1`,
            `beq $r0, $r0, 8`,
            `${command} ${reg_d}, ${reg_t}, ${reg_s}`
        ];
    };
}

const sge = sgeGen("slt");
const sgeu = sgeGen("sltu");

// sgt(u) $d, $s, $t
function sgtGen(command: string) {
    return (components: string) => {
        const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `${command} ${reg_d}, ${reg_t}, ${reg_s}`
        ];
    };
}

const sgt = sgtGen("slt");
const sgtu = sgtGen("sltu");

// sle(u) $d, $s, $t
function sleGen(command: string) {
    return (components: string) => {
        const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
        const reg_d = "$" + comps[0].regName;
        const reg_s = "$" + comps[1].regName;
        const reg_t = "$" + comps[2].regName;
        return [
            `bne ${reg_t}, ${reg_s}, 12`,
            `ori ${reg_d}, $r0, 1`,
            `beq $r0, $r0, 8`,
            `${command} ${reg_d}, ${reg_s}, ${reg_t}`
        ];
    };
}

const sle = sleGen("slt");
const sleu = sleGen("sltu");

// bge(u) $s, $t, label
function bgeGen(command: string) {
    return (components: string) => {
        const comps = <[REG, REG, LABEL]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.LABEL]);
        const reg_s = "$" + comps[0].regName;
        const reg_t = "$" + comps[1].regName;
        const label = comps[2];
        return [
            `${command} $at, ${reg_s}, ${reg_t}`,
            `beq $at, $r0, ${label}`
        ];
    };
}

const bge = bgeGen("slt");
const bgeu = bgeGen("sltu");

// bgt(u) $s, $t, label
function bgtGen(command: string) {
    return (components: string) => {
        const comps = <[REG, REG, LABEL]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.LABEL]);
        const reg_s = "$" + comps[0].regName;
        const reg_t = "$" + comps[1].regName;
        const label = comps[2];
        return [
            `${command} $at, ${reg_t}, ${reg_s}`,
            `bne $at, $r0, ${label}`
        ];
    };
}

const bgt = bgtGen("slt");
const bgtu = bgtGen("sltu");

// ble(u) $s, $t, label
function bleGen(command: string) {
    return (components: string) => {
        const comps = <[REG, REG, LABEL]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.LABEL]);
        const reg_s = "$" + comps[0].regName;
        const reg_t = "$" + comps[1].regName;
        const label = comps[2];
        return [
            `${command} $at, ${reg_t}, ${reg_s}`,
            `beq $at, $r0, ${label}`
        ];
    };
}

const ble = bleGen("slt");
const bleu = bleGen("sltu");

// blt(u) $s, $t, label
function bltGen(command: string) {
    return (components: string) => {
        const comps = <[REG, REG, LABEL]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.LABEL]);
        const reg_s = "$" + comps[0].regName;
        const reg_t = "$" + comps[1].regName;
        const label = comps[2];
        return [
            `${command} $at, ${reg_s}, ${reg_t}`,
            `bne $at, $r0, ${label}`
        ];
    };
}

const blt = bltGen("slt");
const bltu = bltGen("sltu");

// beqz $s, label
function beqz(components: string) {
    const comps = <[REG, LABEL]>parseComponents(components, [CPattern.REG, CPattern.LABEL]);
    const reg_s = "$" + comps[0].regName;
    const label = comps[1];
    return [
        `beq ${reg_s}, $r0, ${label}`
    ];
};

// bnez $s, label
function bnez(components: string) {
    const comps = <[REG, LABEL]>parseComponents(components, [CPattern.REG, CPattern.LABEL]);
    const reg_s = "$" + comps[0].regName;
    const label = comps[1];
    return [
        `bne ${reg_s}, $r0, ${label}`
    ];
};

// la $t0, addr
function la(components: string): string[] | PseudoCodePostProcess {
    const comps = <[REG, PSEUDOADDR]>parseComponents(components, [CPattern.REG, CPattern.PSEUDOADDR]);
    const reg_s = "$" + comps[0].regName;
    const addr = comps[1];
    if (addr.type === PseudoAddr.CONST) {
        // same as 
        // li $t0, imm
        return li(components);
    } else if (addr.type === PseudoAddr.CONST_REG || addr.type === PseudoAddr.REG) {
        return [
            `addi ${reg_s}, $${addr.regName}, ${addr.num || 0}`
        ];
    } else if (addr.type === PseudoAddr.LABEL || addr.type === PseudoAddr.LABEL_CONST) {
        return {
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
};

// li $d, imm
// li $d, large num =>
//    lui $d, high(large num)
//    ori $d, $d, low(large num)
// li $d, small num =>
//    ori $d, $r0, num
function li(components: string) {
    const comps = <[REG, IMM]>parseComponents(components, [CPattern.REG, CPattern.IMM]);
    const reg_s = "$" + comps[0].regName;
    const numBits = byte.bitsNumFill(byte.numToBits(comps[1].num), 32, true);
    const high = byte.bitsToNum(numBits.slice(0, 16), true);
    const low = byte.bitsToNum(numBits.slice(16), true);
    const loadHigh = high ? [`lui ${reg_s}, ${high}`] : [];
    return loadHigh.concat(`ori ${reg_s}, ${high ? reg_s : "$r0"}, ${low}`);
}

// move $d, $s
function move(components: string) {
    const comps = <[REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG]);
    const reg_d = "$" + comps[0].regName;
    const reg_s = "$" + comps[1].regName;
    return [
        `addu ${reg_d}, $r0, ${reg_s}`
    ];
}

const maxNum16bits = (1 << 16) - 1;
