
import { Registers, REG } from "../registers";
import { Word } from "../def";
import Memory from "../memory";
import { Instruction } from "./def";
import { byte } from "../utility";
import { makeInstructionNameMap } from "./util";

// noop, no operation
// Note: The encoding for a NOOP represents the instruction SLL $0, $0, 0 which has no side effects.
//       In fact, nearly every instruction that has $0 as its destination register will have no side effect and can thus be considered a NOOP instruction.
const noop = new Instruction({
    name: "NOOP",
    pattern: "0000 0000 0000 0000 0000 0000 0000 0000",
    compPattern: [],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        regs.advancePC();
    },
    parse: () => byte.makeWord0()
});

// generates a software interrupt
const syscall = new Instruction({
    name: "SYSCALL",
    pattern: "0000 00-- ---- ---- ---- ---- --00 1100",
    compPattern: [],
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const v0 = byte.bitsToNum(regs.getVal(REG.V0), false);
        if (v0 === 10) {
            return true; // halt
        }
        regs.advancePC();
    },
    parse: () => <Word>byte.makeFalseArray(28).concat([true, true, false, false])
});

export const nameMap = makeInstructionNameMap([noop, syscall]);
