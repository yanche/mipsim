
import { Instruction } from "./def";
import { findFirst } from "../utility";
import { Word } from "../def";
import Memory from "../memory";
import { Registers, REG } from "../registers";
import { finder as arithmeticFinder } from "./arithmetic";
import { finder as branchFinder } from "./branch";
import { finder as comparisonFinder } from "./comparison";
import { finder as jumpFinder } from "./jump";
import { finder as loadFinder } from "./load";
import { finder as moveFinder } from "./move";
import { finder as othersFinder } from "./others";
import { finder as storeFinder } from "./store";

// return true: halt, false: continue
export function execute(mem: Memory, regs: Registers): boolean {
    let itrn = mem.readWord(regs.getVal(REG.PC));
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
    arithmeticFinder,
    branchFinder,
    comparisonFinder,
    jumpFinder,
    loadFinder,
    moveFinder,
    othersFinder,
    storeFinder,
];
