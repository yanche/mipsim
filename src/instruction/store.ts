
import { Registers, REG } from "../registers";
import { Word, Byte } from "../def";
import Memory from "../memory";
import { Instruction } from "./def";
import { byte } from "../utility";
import { InstructionComponentPattern as CPattern } from "./pattern";
import { genParserREG1Addr16b, makeInstructionNameMap } from "./util";

// the least significant byte of $t is stored at the specified address
// MEM[$s + offset] = (0xff & $t)
// sb $t, offset($s)
const sb = new Instruction({
    name: "SB",
    pattern: "1010 00ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const imm = itrn.slice(16);
        const offset = <Word>byte.makeArray(16, imm[0]).concat(imm);
        const addr = byte.bitsAdd(regs.getVal(reg_s), offset).result;
        mem.writeByte(addr, <Byte>regs.getVal(reg_t).slice(24));
        regs.advancePC();
    },
    parser: genParserREG1Addr16b("101000")
});

// the contents of $t is stored at the specified address
// MEM[$s + offset] = $t
// sw $t, offset($s)
const sw = new Instruction({
    name: "SW",
    pattern: "1010 11ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const imm = itrn.slice(16);
        const offset = <Word>byte.makeArray(16, imm[0]).concat(imm);
        const addr = byte.bitsAdd(regs.getVal(reg_s), offset).result;
        mem.writeWord(addr, regs.getVal(reg_t));
        regs.advancePC();
    },
    parser: genParserREG1Addr16b("101011")
});

export const nameMap = makeInstructionNameMap([sb, sw]);
