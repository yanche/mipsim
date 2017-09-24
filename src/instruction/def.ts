
import { Word } from "../def";
import Memory from "../memory";
import { Registers } from "../registers";
import { findFirst } from "../utility";

export class Instruction {
    private _pattern: Array<boolean>;
    private _execute: (itrn: Word, mem: Memory, regs: Registers) => void | boolean;

    constructor(options: {
        pattern: string;
        execute: (itrn: Word, mem: Memory, regs: Registers) => void | boolean;
    }) {
        this._pattern = options.pattern.split("").filter(s => s !== " ").map(s => {
            if (s === "0") {
                return false;
            } else if (s === "1") {
                return true;
            } else {
                return undefined;
            }
        });
        if (this._pattern.length !== 32) {
            throw new Error(`instruction pattern should be a string of 32 valid characters(0 1 or others): ${this._pattern.length}`);
        }
        this._execute = options.execute;
    }

    public execute(itrn: Word, mem: Memory, regs: Registers): boolean {
        return this._execute(itrn, mem, regs) || false;
    }

    public match(itrn: Word): boolean {
        return itrn.every((b, idx) => {
            const p = this._pattern[idx];
            return p === undefined || p === b;
        });
    }
}

export class InstructionFinder {
    private _instructions: Instruction[];

    public find(itrn: Word): Instruction {
        return findFirst(this._instructions, i => i.match(itrn), null);
    }

    constructor(instructions: Instruction[]) {
        this._instructions = instructions;
    }
}
