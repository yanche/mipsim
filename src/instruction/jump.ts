
import { Registers, REG } from "../registers";
import { Word } from "../def";
import Memory from "../memory";
import { Instruction, InstructionFinder } from "./def";
import { byte } from "../utility";

// jumps to the calculated address
const j = new Instruction({
    pattern: "0000 10ii iiii iiii iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        // PC = imm << 2
        regs.setVal(REG.PC, <Word>[false, false, false, false].concat(itrn.slice(6)).concat([false, false]));
    }
});

// jumps to the calculated address and link
const jal = new Instruction({
    pattern: "0000 11ii iiii iiii iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        // $RA = $PC + 4
        regs.setVal(REG.RA, byte.bitsAdd(regs.getVal(REG.PC), <Word>byte.makeFalseArray(29).concat([true, false, false])).result);
        // PC = imm << 2
        regs.setVal(REG.PC, <Word>[false, false, false, false].concat(itrn.slice(6)).concat([false, false]));
    }
});

// jumps to the address contained in register $s
const jr = new Instruction({
    pattern: "0000 00ss sss0 0000 0000 0000 0000 1000",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        // PC = $s
        regs.setVal(REG.PC, regs.getVal(reg_s));
    }
});

export const finder = new InstructionFinder([j, jal, jr]);
