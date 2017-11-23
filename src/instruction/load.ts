
import { Registers } from "../registers";
import { Word } from "../def";
import Memory from "../memory";
import { Instruction } from "./def";
import { byte } from "../utility";
import { genParserREG1IMM16b, genParserREG1Addr16b, makeInstructionNameMap } from "./util";

// a byte is loaded into a register from the specified address
// $t = MEM[$s + imm]
// lb $t, offset($s)
const lb = new Instruction({
    name: "LB",
    pattern: "1000 00ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const imm = itrn.slice(16);
        const offset = <Word>byte.makeArray(16, imm[0]).concat(imm);
        const addr = byte.bitsAdd(regs.getVal(reg_s), offset).result;
        const data = <Word>byte.makeFalseArray(24).concat(mem.readByte(addr));
        regs.setVal(reg_t, data);
        regs.advancePC();
    },
    parser: genParserREG1Addr16b("100011")
});

// the immediate value is shifted left 16 bits and stored in the register. The lower 16 bits are zeroes
// $t = (imm << 16)
// imm is unsigned integer
// lui $t, imm
const lui = new Instruction({
    name: "LUI",
    pattern: "0011 11-- ---t tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const imm = itrn.slice(16);
        regs.setVal(reg_t, <Word>imm.concat(byte.makeHalfWord0()));
        regs.advancePC();
    },
    parser: genParserREG1IMM16b("00111100000")
});

// a word is loaded into a register from the specified address
// $t = MEM[$s + offset]
// lw $t, offset($s)
const lw = new Instruction({
    name: "LW",
    pattern: "1000 11ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const imm = itrn.slice(16);
        const offset = <Word>byte.makeArray(16, imm[0]).concat(imm);
        const addr = byte.bitsAdd(regs.getVal(reg_s), offset).result;
        const data = mem.readWord(addr);
        regs.setVal(reg_t, data);
        regs.advancePC();
    },
    parser: genParserREG1Addr16b("100011")
});

export const nameMap = makeInstructionNameMap([lb, lui, lw]);
