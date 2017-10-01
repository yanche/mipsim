
import { Registers, REG } from "../registers";
import { Word } from "../def";
import Memory from "../memory";
import { Instruction, InstructionFinder } from "./def";
import { byte } from "../utility";
import { InstructionComponentPattern as CPattern } from "./pattern";
import { genParserREG1 } from "./util";

// the contents of register HI are moved to the specified register
// $d = $HI
// mfhi $d
const mfhi = new Instruction({
    name: "MFHI",
    pattern: "0000 0000 0000 0000 dddd d000 0001 0000",
    compPattern: [CPattern.REG],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        regs.setVal(reg_d, regs.getVal(REG.HI));
        regs.advancePC();
    },
    parse: genParserREG1("0000000000000000", "00000010000")
});

// the contents of register LO are moved to the specified register
// $d = $LO
// mflo $d
const mflo = new Instruction({
    name: "MFLO",
    pattern: "0000 0000 0000 0000 dddd d000 0001 0010",
    compPattern: [CPattern.REG, CPattern.ADDR],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_d = byte.bits5ToRegNum(itrn, 16);
        regs.setVal(reg_d, regs.getVal(REG.LO));
        regs.advancePC();
    },
    parse: genParserREG1("0000000000000000", "00000010010")
});

export const finder = new InstructionFinder([mfhi, mflo]);
