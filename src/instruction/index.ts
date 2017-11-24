
import { Instruction } from "./def";
import { byte } from "../utility";
import { Word } from "../def";
import Memory from "../memory";
import { Registers, REG } from "../registers";
import { nameMap as arithmeticNameMap } from "./arithmetic";
import { nameMap as branchNameMap } from "./branch";
import { nameMap as comparisonNameMap } from "./comparison";
import { nameMap as jumpNameMap } from "./jump";
import { nameMap as loadNameMap } from "./load";
import { nameMap as moveNameMap } from "./move";
import { nameMap as othersNameMap } from "./others";
import { nameMap as storeNameMap } from "./store";
import { RuntimeErrorCode, SyntaxErrorCode, MIPSError } from "../error";

// return true: halt, false: continue
export function execute(mem: Memory, regs: Registers): boolean {
    const pc = regs.getVal(REG.PC);
    const itrn = mem.readWord(pc);
    const instruction = finder.findByBits(itrn);
    if (!instruction) {
        throw new MIPSError(`unknown instruction: 0x${byte.wordToHexString(itrn)}, at: 0x${byte.wordToHexString(pc)}`, RuntimeErrorCode.UNKNOWN_INSTRUCTION);
    }
    return instruction.execute(itrn, mem, regs);
}

export function parse(codeline: string, instAddr: number, labelMap: Map<string, number>, generated?: boolean): Word {
    const firstspace = codeline.indexOf(" ");
    const insType = firstspace === -1 ? codeline : codeline.slice(0, firstspace);
    const itrn = finder.findByName(insType);
    if (!itrn) {
        throw new MIPSError(`unknown instruction: ${codeline}`, SyntaxErrorCode.UNKNOWN_INSTRUCTION);
    }
    return itrn.parse(firstspace === -1 ? "" : codeline.slice(firstspace + 1), instAddr, labelMap, generated);
}

class InstructionFinder {
    private _instructions: Map<string, Instruction>;

    public findByBits(itrn: Word): Instruction {
        for (let x of this._instructions) {
            if (x[1].match(itrn)) {
                return x[1];
            }
        }
        return undefined;
    }

    public findByName(name: string): Instruction {
        return this._instructions.get(name.toUpperCase());
    }

    constructor(...instructions: Map<string, Instruction>[]) {
        this._instructions = new Map<string, Instruction>();
        for (let map of instructions) {
            for (let x of map) {
                const name = x[0].toUpperCase();
                if (!this._instructions.has(name)) {
                    this._instructions.set(name, x[1]);
                } else {
                    throw new Error(`duplicate definition of instruction: ${x[0]}`);
                }
            }
        }
    }
}

const finder = new InstructionFinder(
    arithmeticNameMap,
    branchNameMap,
    comparisonNameMap,
    jumpNameMap,
    loadNameMap,
    moveNameMap,
    othersNameMap,
    storeNameMap
);
