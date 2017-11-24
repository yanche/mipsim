
import { Word } from "../def";
import Memory from "../memory";
import { Registers } from "../registers";

export interface Parser {
    (components: string, addr: number, labelMap: Map<string, number>, generated?: boolean): Word;
}

export class Instruction {
    private _pattern: Array<boolean>;
    private _execute: (itrn: Word, mem: Memory, regs: Registers) => void | boolean;
    private _name: string;
    private _parser: Parser;

    constructor(options: {
        name: string;
        pattern: string;
        execute: (itrn: Word, mem: Memory, regs: Registers) => void | boolean;
        parser: Parser;
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
        if (!options.execute) {
            throw new Error(`execute function is not provided for instruction`);
        }
        if (!options.parser) {
            throw new Error(`parser is not provided for instruction`);
        }
        if (!options.name || options.name.trim().length === 0) {
            throw new Error(`instruction's name is not provided: ${options.name}`);
        }
        this._execute = options.execute;
        this._parser = options.parser;
        this._name = options.name.trim().toUpperCase();
    }

    public get name(): string {
        return this._name;
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

    public parse(comp: string, addr: number, labelMap: Map<string, number>, generated?: boolean): Word {
        return this._parser(comp, addr, labelMap, generated);
    }
}

export const maxUnsignedNum5Bits = Math.pow(2, 5) - 1;
export const maxUnsignedNum16Bits = Math.pow(2, 16) - 1;
export const maxUnsignedNum26Bits = Math.pow(2, 26) - 1;
export const maxSignedNum16Bits = Math.pow(2, 15) - 1;
export const minSignedNum16Bits = -maxSignedNum16Bits - 1;
