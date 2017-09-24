
import { Registers, REG } from "../registers";
import { Word } from "../def";
import Memory from "../memory";
import { Instruction, InstructionFinder } from "./def";
import { byte } from "../utility";

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

export const finder = new InstructionFinder([slt, sltu, slti, sltiu]);
