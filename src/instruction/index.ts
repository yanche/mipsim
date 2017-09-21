
import { Instruction } from "./def";
import { findFirst } from "../utility";
import { Word } from "../def";
import Memory from "../memory";
import Registers from "../registers";
import { finder as arithmeticFinder } from "./arithmetic";

// return true: halt, false: continue
export function execute(itrn: Word, mem: Memory, regs: Registers): boolean {
    let instruction = findInstruction(itrn);
    return instruction.execute(itrn, mem, regs);
}

function findInstruction(itrn: Word): Instruction {
    for (let i = 0; i < finders.length; ++i) {
        let ins = finders[i].find(itrn);
        if (ins) {
            return ins;
        }
    }
    return null;
}

const finders = [
    arithmeticFinder
];
