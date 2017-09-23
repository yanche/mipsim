
import { REG, Registers } from "../registers";
import { Word, HalfWord } from "../def";
import Memory from "../memory";
import { Instruction, InstructionFinder } from "./def";
import { byte } from "../utility";

// branches if the two registers are equal
const beq = new Instruction({
    pattern: "0001 00ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        if (byte.bitsEqual(regs.getVal(reg_s), regs.getVal(reg_t))) {
            // advance_pc(offset << 2)
            regs.advancePC16BitsOffset(<HalfWord>itrn.slice(16));
        } else {
            regs.advancePC();
        }
    }
});

// branches if the register is greater than or equal to zero
const bgez = new Instruction({
    pattern: "0000 01ss sss0 0001 iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        // first bit is zero means it's non-neg number
        if (!regs.getVal(reg_s)[0]) {
            // advance_pc(offset << 2)
            regs.advancePC16BitsOffset(<HalfWord>itrn.slice(16));
        } else {
            regs.advancePC();
        }
    }
});

// branches if the register is greater than or equal to zero and link
const bgezal = new Instruction({
    pattern: "0000 01ss sss1 0001 iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        // first bit is zero means it's non-neg number
        if (!regs.getVal(reg_s)[0]) {
            // $RA = $PC + 4
            regs.setVal(REG.RA, byte.bitsAdd(regs.getVal(REG.PC), <Word>byte.makeFalseArray(29).concat([true, false, false])).result);
            // advance_pc(offset << 2)
            regs.advancePC16BitsOffset(<HalfWord>itrn.slice(16));
        } else {
            regs.advancePC();
        }
    }
});

// branches if the register is greater than zero
const bgtz = new Instruction({
    pattern: "0001 11ss sss0 0000 iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_s_val = regs.getVal(reg_s);
        // first bit is zero means it's non-neg number
        // at least one digit is 1
        if (!reg_s_val[0] && reg_s_val.some(t => t)) {
            // advance_pc(offset << 2)
            regs.advancePC16BitsOffset(<HalfWord>itrn.slice(16));
        } else {
            regs.advancePC();
        }
    }
});

// branches if the register is less than or equal to zero
const blez = new Instruction({
    pattern: "0001 10ss sss0 0000 iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_s_val = regs.getVal(reg_s);
        // first bit is one means it's neg number
        if (reg_s_val[0] || !reg_s_val.some(t => t)) {
            // advance_pc(offset << 2)
            regs.advancePC16BitsOffset(<HalfWord>itrn.slice(16));
        } else {
            regs.advancePC();
        }
    }
});

// branches if the register is less than zero
const bltz = new Instruction({
    pattern: "0000 01ss sss0 0000 iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        // first bit is one means it's neg number
        if (regs.getVal(reg_s)[0]) {
            // advance_pc(offset << 2)
            regs.advancePC16BitsOffset(<HalfWord>itrn.slice(16));
        } else {
            regs.advancePC();
        }
    }
});

// branches if the register is less than zero and link
const bltzal = new Instruction({
    pattern: "0000 01ss sss1 0000 iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        // first bit is one means it's neg number
        if (regs.getVal(reg_s)[0]) {
            // $RA = $PC + 4
            regs.setVal(REG.RA, byte.bitsAdd(regs.getVal(REG.PC), <Word>byte.makeFalseArray(29).concat([true, false, false])).result);
            // advance_pc(offset << 2)
            regs.advancePC16BitsOffset(<HalfWord>itrn.slice(16));
        } else {
            regs.advancePC();
        }
    }
});

// branches if the two registers are not equal
const bne = new Instruction({
    pattern: "0001 01ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        // first bit is one means it's neg number
        if (!byte.bitsEqual(regs.getVal(reg_s), regs.getVal(reg_t))) {
            // advance_pc(offset << 2)
            regs.advancePC16BitsOffset(<HalfWord>itrn.slice(16));
        } else {
            regs.advancePC();
        }
    }
});

export const finder = new InstructionFinder([beq, bgez, bgezal, bgtz, blez, bltz, bltzal, bne]);

// // unconditional branch to label lab
// export class B {
//     constructor(public lab: string) {

//     }
// }

// // branch to lab if src1 == src2
// export class BEQ {
//     constructor(public src1: Register, public src2: Register | Integer, public lab: string) {

//     }
// }

// // branch to lab if src1 != src2
// export class BNE {
//     constructor(public src1: Register, public src2: Register | Integer, public lab: string) {

//     }
// }

// // branch to lab if src1 >= 0
// export class BGEZ {
//     constructor(public src1: Register, public lab: string) {

//     }
// }

// // branch to lab if src1 > 0
// export class BGTZ {
//     constructor(public src1: Register, public lab: string) {

//     }
// }

// // branch to lab if src1 <= 0
// export class BLEZ {
//     constructor(public src1: Register, public lab: string) {

//     }
// }

// // branch to lab if src1 < 0
// export class BLTZ {
//     constructor(public src1: Register, public lab: string) {

//     }
// }

// // if src1 >= 0, then put the address of the next instruction into $ra and branch to lab
// export class BGEZAL {
//     constructor(public src1: Register, public lab: string) {

//     }
// }

// // if src1 > 0, then put the address of the next instruction into $ra and branch to lab
// export class BGTZAL {
//     constructor(public src1: Register, public lab: string) {

//     }
// }

// // if src1 < 0, then put the address of the next instruction into $ra and branch to lab
// export class BLTZAL {
//     constructor(public src1: Register, public lab: string) {

//     }
// }
