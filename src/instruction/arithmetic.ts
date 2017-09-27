
import { Registers, REG } from "../registers";
import { Word } from "../def";
import Memory from "../memory";
import { Instruction, InstructionFinder } from "./def";
import { byte, flatten } from "../utility";
import { InstructionComponentPattern as CPattern } from "./pattern";
import { genParserREG3, genParserREG2IMM16b, genParserREG2, genParserREG2IMM5b } from "./util";

// $d = $s + $t
// add $d, $s, $t
export const add = new Instruction({
    name: "ADD",
    pattern: "0000 00ss ssst tttt dddd d000 0010 0000",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        // const reg_s = bits5ToRegNum(itrn, 6);
        // const reg_t = bits5ToRegNum(itrn, 11);
        // const reg_d = bits5ToRegNum(itrn, 16);
        // regs.setVal(reg_d, regs.getVal(reg_s) + regs.getVal(reg_t))
    },
    parse: genParserREG3("000000", "00000100000")
});

// $d = $s + $t
// addu $d, $s, $t
export const addu = new Instruction({
    name: "ADDU",
    pattern: "0000 00ss ssst tttt dddd d000 0010 0001",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const add = byte.bitsAdd(regs.getVal(reg_s), regs.getVal(reg_t));
        regs.setVal(reg_d, add.result);
        regs.advancePC();
    },
    parse: genParserREG3("000000", "00000100001")
});

// $t = $s + imm
// addiu $t, $s, imm
export const addiu = new Instruction({
    name: "ADDIU",
    pattern: "0010 01ss ssst tttt iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.IMM],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const add = byte.bitsAdd(regs.getVal(reg_s), <Word>byte.makeHalfWord0().concat(itrn.slice(16)));
        regs.setVal(reg_t, add.result);
        regs.advancePC();
    },
    parse: genParserREG2IMM16b("001001", true)
});

// $d = $s & $t
// and $d, $s, $t
export const and = new Instruction({
    name: "AND",
    pattern: "0000 00ss ssst tttt dddd d000 0010 0100",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const and = byte.bitsAnd(regs.getVal(reg_s), regs.getVal(reg_t));
        regs.setVal(reg_d, and);
        regs.advancePC();
    },
    parse: genParserREG3("000000", "00000100100")
});

// $t = $s & imm
// andi $t, $s, imm
export const andi = new Instruction({
    name: "ANDI",
    pattern: "0011 00ss ssst tttt iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.IMM],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const and = byte.bitsAnd(regs.getVal(reg_s), <Word>byte.makeHalfWord0().concat(itrn.slice(16)));
        regs.setVal(reg_t, and);
        regs.advancePC();
    },
    parse: genParserREG2IMM16b("001100", false)
});

// divides $s by $t and stores the quotient in $LO and the remainder in $HI
// $LO = $s / $t; $HI = $s % $t
// divu $s, $t
export const divu = new Instruction({
    name: "DIVU",
    pattern: "0000 00ss ssst tttt 0000 0000 0001 1011",
    compPattern: [CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const result = byte.bitsDiv(regs.getVal(reg_s), regs.getVal(reg_t), false);
        regs.setVal(REG.LO, result.quotient);
        regs.setVal(REG.HI, result.remainder);
        regs.advancePC();
    },
    parse: genParserREG2("000000", "0000000000011011")
});

// divides $s by $t and stores the quotient in $LO and the remainder in $HI
// $LO = $s / $t; $HI = $s % $t
// div $s, $t
export const div = new Instruction({
    name: "DIV",
    pattern: "0000 00ss ssst tttt 0000 0000 0001 1010",
    compPattern: [CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const result = byte.bitsDiv(regs.getVal(reg_s), regs.getVal(reg_t), true);
        regs.setVal(REG.LO, result.quotient);
        regs.setVal(REG.HI, result.remainder);
        regs.advancePC();
    },
    parse: genParserREG2("000000", "0000000000011010")
});

// multiplies $s by $t and stores the result in $LO
// ($HI, $LO) = $s * $t
// multu $s, $t
export const multu = new Instruction({
    name: "MULTU",
    pattern: "0000 00ss ssst tttt 0000 0000 0001 1001",
    compPattern: [CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const result = byte.bitsMul(regs.getVal(reg_s), regs.getVal(reg_t), false);
        regs.setVal(REG.HI, result.high);
        regs.setVal(REG.LO, result.low);
        regs.advancePC();
    },
    parse: genParserREG2("000000", "0000000000011001")
});

// multiplies $s by $t and stores the result in $LO
// ($HI, $LO) = $s * $t
// mult $s, $t
export const mult = new Instruction({
    name: "MULT",
    pattern: "0000 00ss ssst tttt 0000 0000 0001 1000",
    compPattern: [CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const result = byte.bitsMul(regs.getVal(reg_s), regs.getVal(reg_t), true);
        regs.setVal(REG.HI, result.high);
        regs.setVal(REG.LO, result.low);
        regs.advancePC();
    },
    parse: genParserREG2("000000", "0000000000011000")
});

// $d = $s | $t
// or $d, $s, $t
export const or = new Instruction({
    name: "OR",
    pattern: "0000 00ss ssst tttt dddd d000 0010 0101",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const or = byte.bitsOr(regs.getVal(reg_s), regs.getVal(reg_t));
        regs.setVal(reg_d, or);
        regs.advancePC();
    },
    parse: genParserREG3("000000", "00000100101")
});

// $t = $s | imm
export const ori = new Instruction({
    name: "ORI",
    pattern: "0011 01ss ssst tttt iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.IMM],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const or = byte.bitsOr(regs.getVal(reg_s), <Word>byte.makeHalfWord0().concat(itrn.slice(16)));
        regs.setVal(reg_t, or);
        regs.advancePC();
    },
    parse: genParserREG2IMM16b("001101", false)
});

// shifts a register value left by the shift amount listed in the instruction and places the result in a third register.
// zeroes are shifted in
// $d = $t << h
// sll $d, $t, h
export const sll = new Instruction({
    name: "SLL",
    pattern: "0000 00-- ---t tttt dddd dhhh hh00 0000",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.IMM],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const shiftLeft = byte.bits5ToRegNum(itrn, 21);
        const data = <Word>regs.getVal(reg_t).slice(shiftLeft).concat(byte.makeFalseArray(shiftLeft));
        regs.setVal(reg_d, data);
        regs.advancePC();
    },
    parse: genParserREG2IMM5b("00000000000", "000000")
});

// shifts a register value left by the value in a second register and places the result in a third register.
// zeroes are shifted in
// $d = $t << $s
// sllv $d, $t, $s
export const sllv = new Instruction({
    name: "SLLV",
    pattern: "0000 00ss ssst tttt dddd d--- --00 0100",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const shiftLeft = byte.bitsToNum(regs.getVal(reg_s), false);
        const data = <Word>(shiftLeft >= 32 ? byte.makeWord0() : regs.getVal(reg_t).slice(shiftLeft).concat(byte.makeFalseArray(shiftLeft)));
        regs.setVal(reg_d, data);
        regs.advancePC();
    },
    parse: genParserREG3("000000", "00000000100")
});

// shifts a register value right by the shift amount (shamt) and places the value in the destination register.
// the sign bit is shifted in
// $d = $t >> h
// sra $d, $t, h
export const sra = new Instruction({
    name: "SRA",
    pattern: "0000 00-- ---t tttt dddd dhhh hh00 0011",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.IMM],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const shiftRight = byte.bits5ToRegNum(itrn, 21);
        const reg_t_data = regs.getVal(reg_t);
        const data = <Word>byte.makeArray(shiftRight, reg_t_data[0]).concat(reg_t_data.slice(0, -shiftRight));
        regs.setVal(reg_d, data);
        regs.advancePC();
    },
    parse: genParserREG2IMM5b("00000000000", "000011")
});

// shifts a register value right by the shift amount (shamt) and places the value in the destination register
// zeroes are shifted in
// $d = $t >> h
// srl $d, $t, h
export const srl = new Instruction({
    name: "SRL",
    pattern: "0000 00-- ---t tttt dddd dhhh hh00 0010",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.IMM],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const shiftRight = byte.bits5ToRegNum(itrn, 21);
        const reg_t_data = regs.getVal(reg_t);
        const data = <Word>byte.makeFalseArray(shiftRight).concat(reg_t_data.slice(0, -shiftRight));
        regs.setVal(reg_d, data);
        regs.advancePC();
    },
    parse: genParserREG2IMM5b("00000000000", "000010")
});

// shifts a register value right by the amount specified in $s and places the value in the destination register
// zeroes are shifted in
// $d = $t >> $s
// srlv $d, $t, $s
export const srlv = new Instruction({
    name: "SRLV",
    pattern: "0000 00ss ssst tttt dddd d000 0000 0110",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const shiftRight = byte.bitsToNum(regs.getVal(reg_s), false);
        const reg_t_data = regs.getVal(reg_t);
        const data = <Word>byte.makeFalseArray(shiftRight).concat(reg_t_data.slice(0, -shiftRight));
        regs.setVal(reg_d, data);
        regs.advancePC();
    },
    parse: genParserREG3("000000", "00000000110")
});

// subtracts two registers and stores the result in a register
// $d = $s - $t
// sub $d, $s, $t
export const sub = new Instruction({
    name: "SUB",
    pattern: "0000 00ss ssst tttt dddd d000 0010 0010",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        // const reg_s = byte.bits5ToRegNum(itrn, 6);
        // const reg_t = byte.bits5ToRegNum(itrn, 11);
        // const reg_d = byte.bits5ToRegNum(itrn, 16);
        // const add = byte.bitsAdd(regs.getVal(reg_s), regs.getVal(reg_t));
        // regs.setVal(reg_d, add.result);
        // regs.advancePC();
    },
    parse: genParserREG3("000000", "00000100010")
});

// subtracts two registers and stores the result in a register
// $d = $s - $t
// subu $d, $s, $t
export const subu = new Instruction({
    name: "SUBU",
    pattern: "0000 00ss ssst tttt dddd d000 0010 0011",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const num_s = byte.bitsToNum(regs.getVal(reg_s), false);
        const num_t = byte.bitsToNum(regs.getVal(reg_t), false);
        const num_d = num_s - num_t;
        let bits_d = byte.numToBits(num_d);
        if (bits_d.length < 32) {
            bits_d = byte.makeArray(32 - bits_d.length, bits_d[0]).concat(bits_d);
        }
        regs.setVal(reg_d, <Word>bits_d);
        regs.advancePC();
    },
    parse: genParserREG3("000000", "00000100011")
});

// bitwise exclusive ors two registers and stores the result in a register
// $d = $s ^ $t
// xor $d, $s, $t
export const xor = new Instruction({
    name: "XOR",
    pattern: "0000 00ss ssst tttt dddd d--- --10 0110",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const data = byte.bitsXor(regs.getVal(reg_s), regs.getVal(reg_t));
        regs.setVal(reg_d, data);
        regs.advancePC();
    },
    parse: genParserREG3("000000", "00000100110")
});

// bitwise exclusive ors a register and an immediate value and stores the result in a register
// $t = $s ^ imm
export const xori = new Instruction({
    name: "XORI",
    pattern: "0011 10ss ssst tttt iiii iiii iiii iiii",
    compPattern: [CPattern.REG, CPattern.REG, CPattern.IMM],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const imm = itrn.slice(16);
        const data = byte.bitsXor(regs.getVal(reg_s), <Word>byte.makeHalfWord0().concat(imm));
        regs.setVal(reg_t, data);
        regs.advancePC();
    },
    parse: genParserREG2IMM16b("001110", false)
});

export const finder = new InstructionFinder([
    add, addu, addiu, and, andi, divu, div, multu, mult, or, ori,
    sll, sllv, sra, srl, srlv, sub, subu, xor, xori
]);
