
import { REG, Registers } from "../registers";
import { Word, HalfWord } from "../def";
import Memory from "../memory";
import { Instruction } from "./def";
import { byte } from "../utility";
import { InstructionComponentPattern as CPattern } from "./pattern";
import { genParserREG2IMM16b, genParserREG1IMM16b, makeInstructionNameMap } from "./util";

// branches if the two registers are equal
// beq $s, $t, offset
const beq = new Instruction({
    name: "BEQ",
    pattern: "0001 00ss ssst tttt iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.IMM],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        if (byte.bitsEqual(regs.getVal(reg_s), regs.getVal(reg_t))) {
            // advance_pc(offset << 2)
            regs.advancePC16BitsOffset(<HalfWord>itrn.slice(16));
        } else {
            regs.advancePC();
        }
    },
    parse: genParserREG2IMM16b("000100", true)
});

// branches if the register is greater than or equal to zero
// bgez $s, offset
const bgez = new Instruction({
    name: "BGEZ",
    pattern: "0000 01ss sss0 0001 iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.IMM],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        // first bit is zero means it's non-neg number
        if (!regs.getVal(reg_s)[0]) {
            // advance_pc(offset << 2)
            regs.advancePC16BitsOffset(<HalfWord>itrn.slice(16));
        } else {
            regs.advancePC();
        }
    },
    parse: genParserREG1IMM16b("000001", "00001", true)
});

// branches if the register is greater than or equal to zero and link
// bgezal $s, offset
const bgezal = new Instruction({
    name: "BGEZAL",
    pattern: "0000 01ss sss1 0001 iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.IMM],
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
    },
    parse: genParserREG1IMM16b("000001", "10001", true)
});

// branches if the register is greater than zero
// bgtz $s, offset
const bgtz = new Instruction({
    name: "BGTZ",
    pattern: "0001 11ss sss0 0000 iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.IMM],
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
    },
    parse: genParserREG1IMM16b("000111", "00000", true)
});

// branches if the register is less than or equal to zero
// blez $s, offset
const blez = new Instruction({
    name: "BLEZ",
    pattern: "0001 10ss sss0 0000 iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.IMM],
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
    },
    parse: genParserREG1IMM16b("000110", "00000", true)
});

// branches if the register is less than zero
// bltz $s, offset
const bltz = new Instruction({
    name: "BLTZ",
    pattern: "0000 01ss sss0 0000 iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.IMM],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        // first bit is one means it's neg number
        if (regs.getVal(reg_s)[0]) {
            // advance_pc(offset << 2)
            regs.advancePC16BitsOffset(<HalfWord>itrn.slice(16));
        } else {
            regs.advancePC();
        }
    },
    parse: genParserREG1IMM16b("000001", "00000", true)
});

// branches if the register is less than zero and link
// bltzal $s, offset
const bltzal = new Instruction({
    name: "BLTZAL",
    pattern: "0000 01ss sss1 0000 iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.IMM],
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
    },
    parse: genParserREG1IMM16b("000001", "10000", true)
});

// branches if the two registers are not equal
// bne $s, $t, offset
const bne = new Instruction({
    name: "BNE",
    pattern: "0001 01ss ssst tttt iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.IMM],
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
    },
    parse: genParserREG2IMM16b("000101", true)
});

export const nameMap = makeInstructionNameMap([beq, bgez, bgezal, bgtz, blez, bltz, bltzal, bne]);
