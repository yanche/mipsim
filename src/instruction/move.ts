
import { Registers, REG } from "../registers";
import { Word } from "../def";
import Memory from "../memory";
import { Instruction, InstructionFinder } from "./def";
import { byte } from "../utility";

// the contents of register HI are moved to the specified register
// $d = $HI
const mfhi = new Instruction({
    pattern: "0000 0000 0000 0000 dddd d000 0001 0000",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        regs.setVal(reg_d, regs.getVal(REG.HI));
        regs.advancePC();
    }
});

// the contents of register LO are moved to the specified register
// $d = $LO
const mflo = new Instruction({
    pattern: "0000 0000 0000 0000 dddd d000 0001 0010",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        regs.setVal(reg_d, regs.getVal(REG.LO));
        regs.advancePC();
    }
});

export const finder = new InstructionFinder([mfhi, mflo]);
