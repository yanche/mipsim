
import Memory from "../memory";
import { Registers, REG } from "../registers";
import { codeStartAddr, stackPointerAddr, heapPointerAddr, heapPointerVal, Word } from "../def";
import * as instruction from "../instruction";
import { parseMIPSCode, SourceInstruction } from "../parser";
import { byte } from "../utility";
import { MIPSError } from "../error/index";
import * as _console from "../console";

export class Program {
    private _sources: string[];
    private _sourceMap: Map<number, SourceInstruction>;
    private _mem: Memory;
    private _regs: Registers;
    private _halt: boolean;

    constructor(sources: string[]) {
        this._sources = sources;
        this._regs = new Registers();
        this._regs.setVal(REG.PC, <Word>byte.wordFromHexStr(codeStartAddr).bits); // set program start address
        this._regs.setVal(REG.SP, <Word>byte.wordFromHexStr(stackPointerAddr).bits); // set $sp
        this._parse();
    }

    public get regs(): Registers {
        return this._regs;
    }

    public get mem(): Memory {
        return this._mem;
    }

    public run() {
        if (this._halt) {
            _console.write("program stopped\n");
            return;
        }

        do {
            this.step();
        } while (!this._halt);
    }

    public getDirtyInfo() {
        return {
            regs: this._regs.getDirtyInfo(),
            mem: this._mem.getDirtyInfo(),
        };
    }

    public step() {
        if (this._halt) {
            _console.write("program stopped\n");
            return;
        }

        this._mem.clearDirty();
        this._regs.clearDirty();

        const pc = this._regs.getVal(REG.PC);
        try {
            this._halt = instruction.execute(this._mem, this._regs);
        }
        catch (err) {
            const pcNum = byte.bitsToNum(pc, false);
            const source = this._sourceMap.get(pcNum);
            _console.write(`error happens at 0x${byte.wordToHexString(pc)}\n`);
            _console.write(`${source.source}${source.originSource ? ` (${source.pseudoConvIdx} from pseudo ${source.originSource})` : ""}\n`)
            _console.write(err.stack + "\n");
            this._halt = true;
        }
    }

    public getSource(addr: number): SourceInstruction {
        if (this._sourceMap.has(addr)) {
            const ret = this._sourceMap.get(addr);
            return {
                source: ret.source,
                originSource: ret.originSource,
                pseudoConvIdx: ret.pseudoConvIdx
            };
        } else {
            throw new Error(`given address is not part of code: ${addr}`);
        }
    }

    private _parse() {
        try {
            const parseret = parseMIPSCode(this._sources);
            this._sourceMap = parseret.sourceMap;
            this._mem = parseret.mem;
            // the heap pointer, first word of global data segment
            this._mem.writeWord(byte.wordFromHexStr(heapPointerAddr).bits, byte.wordFromHexStr(heapPointerVal).bits);
        }
        catch (err) {
            if (err instanceof MIPSError) {
                _console.write(err.message + ", line number: " + err.lineNum + "\n");
                _console.write(err.stack + "\n");
            } else {
                _console.write(err.stack + "\n");
            }
        }
    }
}
