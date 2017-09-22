
import Memory from "../memory";
import { Registers } from "../registers";
import { Addr } from "../def";
import * as instruction from "../instruction";

function execute(mem: Memory, regs: Registers, addr: Addr) {
    let halt = false;
    do {
        let itrn = mem.readword(addr);
        halt = instruction.execute(itrn, mem, regs);
    } while (!halt);
}
