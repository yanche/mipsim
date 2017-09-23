
import { Registers, REG } from "../registers";
import { Word, Byte } from "../def";
import Memory from "../memory";
import { Instruction, InstructionFinder } from "./def";
import { byte } from "../utility";

// the least significant byte of $t is stored at the specified address
// MEM[$s + offset] = (0xff & $t)
const sb = new Instruction({
    pattern: "1010 00ss ssst tttt iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        const reg_t = byte.bits5ToRegNum(itrn, 11);
        const imm = itrn.slice(16);
        const offset = <Word>byte.makeArray(16, imm[0]).concat(imm);
        const addr = byte.bitsAdd(regs.getVal(reg_s), offset).result;
        mem.writeByte(addr, <Byte>regs.getVal(reg_t).slice(24));
        regs.advancePC();
    }
});
