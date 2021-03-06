
import { Registers, REG } from "../registers";
import { Word } from "../def";
import Memory from "../memory";
import { Instruction } from "./def";
import { byte } from "../utility";
import { genParserREG1, genParserLabelIMM26b, makeInstructionNameMap } from "./util";

// jumps to the calculated address
// j target
export const j = new Instruction({
    name: "J",
    pattern: "0000 10ii iiii iiii iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        // PC = imm << 2
        regs.setVal(REG.PC, <Word>[false, false, false, false].concat(itrn.slice(6)).concat([false, false]));
    },
    parser: genParserLabelIMM26b("000010")
});

// jumps to the calculated address and link
// jal target
export const jal = new Instruction({
    name: "JAL",
    pattern: "0000 11ii iiii iiii iiii iiii iiii iiii",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        // $RA = $PC + 4
        regs.setVal(REG.RA, byte.bitsAdd(regs.getVal(REG.PC), <Word>byte.makeFalseArray(29).concat([true, false, false])).result);
        // PC = imm << 2
        regs.setVal(REG.PC, <Word>[false, false, false, false].concat(itrn.slice(6)).concat([false, false]));
    },
    parser: genParserLabelIMM26b("000011")
});

// jumps to the address contained in register $s
// 	jr $s
export const jr = new Instruction({
    name: "JR",
    pattern: "0000 00ss sss0 0000 0000 0000 0000 1000",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const reg_s = byte.bits5ToRegNum(itrn, 6);
        // PC = $s
        regs.setVal(REG.PC, regs.getVal(reg_s));
    },
    parser: genParserREG1("000000", "000000000000000001000")
});

export const nameMap = makeInstructionNameMap([j, jal, jr]);
