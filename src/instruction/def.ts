
import { Word } from "../def";
import Memory from "../memory";
import { Registers } from "../registers";
import { findFirst, validate } from "../utility";
import { InstructionComponentPattern, parseComponent, REG, ADDR, IMM } from "./pattern";

export class Instruction {
    private _pattern: Array<boolean>;
    private _execute: (itrn: Word, mem: Memory, regs: Registers) => void | boolean;
    private _name: string;
    private _compPattern: InstructionComponentPattern[];
    private _parse: (components: Array<REG | ADDR | IMM>) => Word;

    constructor(options: {
        name: string;
        pattern: string;
        execute: (itrn: Word, mem: Memory, regs: Registers) => void | boolean;
        parse: (components: Array<REG | ADDR | IMM>) => Word; // literal instruction components to bits instruction
        compPattern: InstructionComponentPattern[];
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
        if (!Array.isArray(options.compPattern)) {
            throw new Error(`component pattern must be provided as an array: ${options.compPattern}`);
        }
        if (!options.parse) {
            throw new Error(`parse function is not provided for instruction`);
        }
        if (!options.name || options.name.trim().length === 0) {
            throw new Error(`instruction's name is not provided: ${options.name}`);
        }
        this._execute = options.execute;
        this._compPattern = options.compPattern;
        this._parse = options.parse;
        this._name = options.name.trim().toUpperCase();
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

    public parse(comp: string): Word {
        comp = comp.replace(",", " ");
        const components = comp.split(" ").filter(x => x.length > 0);
        if (components.length !== this._compPattern.length) {
            throw new Error(`invalid component part of ${this._name} instruction: ${comp}`);
        }
        return this._parse(components.map((c, idx) => parseComponent(c, this._compPattern[idx])));
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

export const maxUnsignedNum5Bits = Math.pow(2, 5) - 1;
export const maxUnsignedNum16Bits = Math.pow(2, 16) - 1;
export const maxUnsignedNum26Bits = Math.pow(2, 26) - 1;
export const maxSignedNum16Bits = Math.pow(2, 15) - 1;
export const minSignedNum16Bits = -maxSignedNum16Bits - 1;
