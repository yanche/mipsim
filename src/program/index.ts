
import Memory from "../memory";
import { Registers, REG } from "../registers";
import { codeStartAddr, stackPointerAddr, heapPointerAddr, heapPointerVal, Word } from "../def";
import * as instruction from "../instruction";
import { parseMIPSCode, SourceInstruction } from "../parser";
import { byte } from "../utility";
import { MIPSError } from "../error/index";
import * as _console from "../console";

function execute(mem: Memory, regs: Registers, sourceMap: Map<number, SourceInstruction>) {
    let halt = false;
    do {
        const pc = regs.getVal(REG.PC);
        try {
            halt = instruction.execute(mem, regs);
        }
        catch (err) {
            const pcNum = byte.bitsToNum(pc, false);
            const source = sourceMap.get(pcNum);
            _console.write(`error happens at 0x${byte.wordToHexString(pc)}\n`);
            _console.write(`${source.source}${source.originSource ? ` (${source.pseudoConvIdx} from pseudo ${source.originSource})` : ""}\n`)
            _console.write(err.stack + "\n");
            halt = true;
        }
    } while (!halt);
}

export function executeMIPSCode(codelines: string[]): void {
    try {
        const regs = new Registers();
        regs.setVal(REG.PC, <Word>byte.wordFromHexStr(codeStartAddr).bits); // set program start address
        regs.setVal(REG.SP, <Word>byte.wordFromHexStr(stackPointerAddr).bits); // set $sp
        const { mem, sourceMap } = parseMIPSCode(codelines);
        // the heap pointer, first word of global data segment
        mem.writeWord(byte.wordFromHexStr(heapPointerAddr).bits, byte.wordFromHexStr(heapPointerVal).bits);
        execute(mem, regs, sourceMap);
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
