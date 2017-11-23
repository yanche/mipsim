
import Memory from "../memory";
import { Registers, REG } from "../registers";
import { codeStartAddr } from "../def";
import * as instruction from "../instruction";
import * as parser from "../parser";

function execute(mem: Memory, regs: Registers) {
    let halt = false;
    do {
        halt = instruction.execute(mem, regs);
    } while (!halt);
}

export function executeMIPSCode(codelines: string[]): void {
    const regs = new Registers();
    regs.setVal(REG.PC, codeStartAddr); // set program start address
    execute(parser.parseMIPSCode(codelines), regs);
}
