
import Memory from "../memory";
import { Registers, REG } from "../registers";
import { codeStartAddr, stackPointerAddr, heapPointerAddr, heapPointerVal, Word } from "../def";
import * as instruction from "../instruction";
import * as parser from "../parser";
import { byte } from "../utility";

function execute(mem: Memory, regs: Registers) {
    let halt = false;
    do {
        halt = instruction.execute(mem, regs);
    } while (!halt);
}

export function executeMIPSCode(codelines: string[]): void {
    const regs = new Registers();
    regs.setVal(REG.PC, <Word>byte.wordFromHexStr(codeStartAddr)); // set program start address
    regs.setVal(REG.SP, <Word>byte.wordFromHexStr(stackPointerAddr)); // set $sp
    const mem = parser.parseMIPSCode(codelines);
    // the heap pointer, first word of global data segment
    mem.writeWord(byte.wordFromHexStr(heapPointerAddr).bits, byte.wordFromHexStr(heapPointerVal).bits);
    execute(mem, regs);
}
