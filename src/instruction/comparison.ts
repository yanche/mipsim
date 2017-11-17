
import { Registers, REG } from "../registers";
import { Word } from "../def";
import Memory from "../memory";
import { Instruction } from "./def";
import { byte } from "../utility";
import { InstructionComponentPattern as CPattern } from "./pattern";
import { genParserREG3, genParserREG2IMM16b, makeInstructionNameMap } from "./util";

// if $s is less than $t, $d is set to one. It gets zero otherwise
// if $s < $t $d = 1; else $d = 0;
// both $s and $t will be treated as signed
// slt $d, $s, $t
const slt = new Instruction({
    name: "SLT",
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
    },
    parser: genParserREG3("000000", "00000101010")
});

// if $s is less than $t, $d is set to one. It gets zero otherwise.
// if $s < $t $d = 1; else $d = 0;
// both $s and $t will be treated as unsigned
// sltu $d, $s, $t
const sltu = new Instruction({
    name: "SLTU",
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
    },
    parser: genParserREG3("000000", "00000101011")
});

// if $s is less than immediate, $t is set to one. It gets zero otherwise
// if $s < imm $t = 1; else $t = 0;
// both $s and imm will be treated as signed
// slti $t, $s, imm
const slti = new Instruction({
    name: "SLTI",
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
    },
    parser: genParserREG2IMM16b("001010")
});

// if $s is less than the unsigned immediate, $t is set to one. It gets zero otherwise
// if $s < imm $t = 1; else $t = 0;
// both $s and imm will be treated as unsigned
// sltiu $t, $s, imm
const sltiu = new Instruction({
    name: "SLTIU",
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
    },
    parser: genParserREG2IMM16b("001011")
});

export const nameMap = makeInstructionNameMap([slt, sltu, slti, sltiu]);
