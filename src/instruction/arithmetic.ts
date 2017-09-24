
import { Registers, REG } from "../registers";
import { Word } from "../def";
import Memory from "../memory";
import { Instruction, InstructionFinder } from "./def";
import { byte } from "../utility";

// $d = $s + $t
const add = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d000 0010 0000",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        // const reg_s = bits5ToRegNum(itrn, 6);
        // const reg_t = bits5ToRegNum(itrn, 11);
        // const reg_d = bits5ToRegNum(itrn, 16);
        // regs.setVal(reg_d, regs.getVal(reg_s) + regs.getVal(reg_t))
    }
});

// $d = $s + $t
const addu = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d000 0010 0001",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const add = byte.bitsAdd(regs.getVal(reg_s), regs.getVal(reg_t));
        regs.setVal(reg_d, add.result);
        regs.advancePC();
    }
});

// $t = $s + imm
const addiu = new Instruction({
    pattern: "0010 01ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const add = byte.bitsAdd(regs.getVal(reg_s), <Word>byte.makeHalfWord0().concat(itrn.slice(16)));
        regs.setVal(reg_t, add.result);
        regs.advancePC();
    }
});

// $d = $s & $t
const and = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d000 0010 0100",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const and = byte.bitsAnd(regs.getVal(reg_s), regs.getVal(reg_t));
        regs.setVal(reg_d, and);
        regs.advancePC();
    }
});

// $t = $s & imm
const andi = new Instruction({
    pattern: "0011 00ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const and = byte.bitsAnd(regs.getVal(reg_s), <Word>byte.makeHalfWord0().concat(itrn.slice(16)));
        regs.setVal(reg_t, and);
        regs.advancePC();
    }
});

// divides $s by $t and stores the quotient in $LO and the remainder in $HI
// $LO = $s / $t; $HI = $s % $t
const divu = new Instruction({
    pattern: "0000 00ss ssst tttt 0000 0000 0001 1011",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const result = byte.bitsDiv(regs.getVal(reg_s), regs.getVal(reg_t), false);
        regs.setVal(REG.LO, result.quotient);
        regs.setVal(REG.HI, result.remainder);
        regs.advancePC();
    }
});

// divides $s by $t and stores the quotient in $LO and the remainder in $HI
// $LO = $s / $t; $HI = $s % $t
const div = new Instruction({
    pattern: "0000 00ss ssst tttt 0000 0000 0001 1010",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const result = byte.bitsDiv(regs.getVal(reg_s), regs.getVal(reg_t), true);
        regs.setVal(REG.LO, result.quotient);
        regs.setVal(REG.HI, result.remainder);
        regs.advancePC();
    }
});

// multiplies $s by $t and stores the result in $LO
// $LO = $s * $t
const multu = new Instruction({
    pattern: "0000 00ss ssst tttt 0000 0000 0001 1001",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const result = byte.bitsMul(regs.getVal(reg_s), regs.getVal(reg_t), false);
        regs.setVal(REG.HI, result.high);
        regs.setVal(REG.LO, result.low);
        regs.advancePC();
    }
});

// multiplies $s by $t and stores the result in $LO
// $LO = $s * $t
const mult = new Instruction({
    pattern: "0000 00ss ssst tttt 0000 0000 0001 1000",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const result = byte.bitsMul(regs.getVal(reg_s), regs.getVal(reg_t), true);
        regs.setVal(REG.HI, result.high);
        regs.setVal(REG.LO, result.low);
        regs.advancePC();
    }
});

// $d = $s | $t
const or = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d000 0010 0101",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const or = byte.bitsOr(regs.getVal(reg_s), regs.getVal(reg_t));
        regs.setVal(reg_d, or);
        regs.advancePC();
    }
});

// $t = $s | imm
const ori = new Instruction({
    pattern: "0011 01ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const or = byte.bitsOr(regs.getVal(reg_s), <Word>byte.makeHalfWord0().concat(itrn.slice(16)));
        regs.setVal(reg_t, or);
        regs.advancePC();
    }
});

// if $s is less than $t, $d is set to one. It gets zero otherwise
// if $s < $t $d = 1; else $d = 0;
// both $s and $t will be treated as signed
const slt = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d000 0010 1010",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const num_s = byte.bitsToNum(regs.getVal(reg_s), true);
        const num_t = byte.bitsToNum(regs.getVal(reg_t), true);
        if (num_s < num_t) {
            regs.setVal(reg_d, <Word>byte.makeFalseArray(31).concat(true));
        } else {
            regs.setVal(reg_d, byte.makeWord0());
        }
        regs.advancePC();
    }
});

// if $s is less than $t, $d is set to one. It gets zero otherwise.
// if $s < $t $d = 1; else $d = 0;
// both $s and $t will be treated as unsigned
const sltu = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d000 0010 1011",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const num_s = byte.bitsToNum(regs.getVal(reg_s), false);
        const num_t = byte.bitsToNum(regs.getVal(reg_t), false);
        if (num_s < num_t) {
            regs.setVal(reg_d, <Word>byte.makeFalseArray(31).concat(true));
        } else {
            regs.setVal(reg_d, byte.makeWord0());
        }
        regs.advancePC();
    }
});

// if $s is less than immediate, $t is set to one. It gets zero otherwise
// if $s < imm $t = 1; else $t = 0;
// both $s and imm will be treated as signed
const slti = new Instruction({
    pattern: "0010 10ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const imm = byte.bitsToNum(itrn.slice(16), true);
        const num_s = byte.bitsToNum(regs.getVal(reg_s), true);
        if (num_s < imm) {
            regs.setVal(reg_t, <Word>byte.makeFalseArray(31).concat(true));
        } else {
            regs.setVal(reg_t, byte.makeWord0());
        }
        regs.advancePC();
    }
});

// if $s is less than the unsigned immediate, $t is set to one. It gets zero otherwise
// if $s < imm $t = 1; else $t = 0;
// both $s and imm will be treated as unsigned
const sltiu = new Instruction({
    pattern: "0010 11ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const imm = byte.bitsToNum(itrn.slice(16), false);
        const num_s = byte.bitsToNum(regs.getVal(reg_s), false);
        if (num_s < imm) {
            regs.setVal(reg_t, <Word>byte.makeFalseArray(31).concat(true));
        } else {
            regs.setVal(reg_t, byte.makeWord0());
        }
        regs.advancePC();
    }
});

// shifts a register value left by the shift amount listed in the instruction and places the result in a third register.
// zeroes are shifted in
// $d = $t << h
const sll = new Instruction({
    pattern: "0000 00-- ---t tttt dddd dhhh hh00 0000",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const shiftLeft = byte.bits5ToRegNum(itrn, 21);
        const data = <Word>regs.getVal(reg_t).slice(shiftLeft).concat(byte.makeFalseArray(shiftLeft));
        regs.setVal(reg_d, data);
        regs.advancePC();
    }
});

// shifts a register value left by the value in a second register and places the result in a third register.
// zeroes are shifted in
// $d = $t << $s
const sllv = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d--- --00 0100",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const shiftLeft = byte.bitsToNum(regs.getVal(reg_s), false);
        const data = <Word>(shiftLeft >= 32 ? byte.makeWord0() : regs.getVal(reg_t).slice(shiftLeft).concat(byte.makeFalseArray(shiftLeft)));
        regs.setVal(reg_d, data);
        regs.advancePC();
    }
});

// shifts a register value right by the shift amount (shamt) and places the value in the destination register.
// the sign bit is shifted in
// $d = $t >> h
const sra = new Instruction({
    pattern: "0000 00-- ---t tttt dddd dhhh hh00 0011",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const shiftRight = byte.bits5ToRegNum(itrn, 21);
        const reg_t_data = regs.getVal(reg_t);
        const data = <Word>byte.makeArray(shiftRight, reg_t_data[0]).concat(reg_t_data.slice(0, -shiftRight));
        regs.setVal(reg_d, data);
        regs.advancePC();
    }
});

// shifts a register value right by the shift amount (shamt) and places the value in the destination register
// zeroes are shifted in
// $d = $t >> h
const srl = new Instruction({
    pattern: "0000 00-- ---t tttt dddd dhhh hh00 0010",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const shiftRight = byte.bits5ToRegNum(itrn, 21);
        const reg_t_data = regs.getVal(reg_t);
        const data = <Word>byte.makeFalseArray(shiftRight).concat(reg_t_data.slice(0, -shiftRight));
        regs.setVal(reg_d, data);
        regs.advancePC();
    }
});

// shifts a register value right by the amount specified in $s and places the value in the destination register
// zeroes are shifted in
// $d = $t >> $s
const srlv = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d000 0000 0110",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const shiftRight = byte.bitsToNum(regs.getVal(reg_s), false);
        const reg_t_data = regs.getVal(reg_t);
        const data = <Word>byte.makeFalseArray(shiftRight).concat(reg_t_data.slice(0, -shiftRight));
        regs.setVal(reg_d, data);
        regs.advancePC();
    }
});

// subtracts two registers and stores the result in a register
// $d = $s - $t
const sub = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d000 0010 0010",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        // const reg_s = byte.bits5ToRegNum(itrn, 6);
        // const reg_t = byte.bits5ToRegNum(itrn, 11);
        // const reg_d = byte.bits5ToRegNum(itrn, 16);
        // const add = byte.bitsAdd(regs.getVal(reg_s), regs.getVal(reg_t));
        // regs.setVal(reg_d, add.result);
        // regs.advancePC();
    }
});

// subtracts two registers and stores the result in a register
// $d = $s - $t
const subu = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d000 0010 0011",
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
    }
});

// bitwise exclusive ors two registers and stores the result in a register
// $d = $s ^ $t
const xor = new Instruction({
    pattern: "0000 00ss ssst tttt dddd d--- --10 0110",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        const data = byte.bitsXor(regs.getVal(reg_s), regs.getVal(reg_t));
        regs.setVal(reg_d, data);
        regs.advancePC();
    }
});

// bitwise exclusive ors a register and an immediate value and stores the result in a register
// $t = $s ^ imm
const xori = new Instruction({
    pattern: "0011 10ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const imm = itrn.slice(16);
        const data = byte.bitsXor(regs.getVal(reg_s), <Word>byte.makeHalfWord0().concat(imm));
        regs.setVal(reg_t, data);
        regs.advancePC();
    }
});

export const finder = new InstructionFinder([
    add, addu, addiu, and, andi, divu, div, multu, mult, or, ori, slt, sltu,
    slti, sltiu, sll, sllv, sra, srl, srlv, sub, subu, xor, xori
]);
