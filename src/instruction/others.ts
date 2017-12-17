
import { Registers, REG } from "../registers";
import { Word, heapPointerAddr } from "../def";
import Memory from "../memory";
import { Instruction } from "./def";
import { byte } from "../utility";
import { makeInstructionNameMap } from "./util";
import { MIPSError, RuntimeErrorCode } from "../error";
import * as _console from "../console";

const heapPtrAddr = byte.wordFromHexStr(heapPointerAddr).bits;

// noop, no operation
// Note: The encoding for a NOOP represents the instruction SLL $0, $0, 0 which has no side effects.
//       In fact, nearly every instruction that has $0 as its destination register will have no side effect and can thus be considered a NOOP instruction.
export const noop = new Instruction({
    name: "NOP",
    pattern: "0000 0000 0000 0000 0000 0000 0000 0000",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        regs.advancePC();
    },
    parser: () => byte.makeWord0()
});

// generates a software interrupt
export const syscall = new Instruction({
    name: "SYSCALL",
    pattern: "0000 00-- ---- ---- ---- ---- --00 1100",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        const v0 = byte.bitsToNum(regs.getVal(REG.V0), false);
        switch (v0) {
            case 1:
                // print int
                _console.write(byte.bitsToNum(regs.getVal(REG.A0), true));
                break;
            case 2:
                // print float
                throw new MIPSError("not implemented", RuntimeErrorCode.NOT_YET_IMPLEMENTED);
            case 3:
                // print double
                throw new MIPSError("not implemented", RuntimeErrorCode.NOT_YET_IMPLEMENTED);
            case 4:
                // print string
                let addr = regs.getVal(REG.A0);
                let output = "";
                let charcode = byte.bitsToNum(mem.readByte(addr), false);
                while (charcode) {
                    output += String.fromCharCode(charcode);
                    addr = byte.bitsAdd(addr, <Word>byte.makeFalseArray(31).concat(true)).result;
                    charcode = byte.bitsToNum(mem.readByte(addr), false);
                }
                _console.write(output);
                break;
            case 5:
                // read int
                throw new MIPSError("not implemented", RuntimeErrorCode.NOT_YET_IMPLEMENTED);
            case 6:
                // read float
                throw new MIPSError("not implemented", RuntimeErrorCode.NOT_YET_IMPLEMENTED);
            case 7:
                // read double
                throw new MIPSError("not implemented", RuntimeErrorCode.NOT_YET_IMPLEMENTED);
            case 8:
                // read string
                throw new MIPSError("not implemented", RuntimeErrorCode.NOT_YET_IMPLEMENTED);
            case 9:
                // sbrk
                const heapPointerVal = mem.readWord(heapPtrAddr);
                regs.setVal(REG.V0, heapPointerVal);
                const len = regs.getVal(REG.A0);
                const newHeapPointerVal = byte.bitsAdd(heapPointerVal, len).result;
                mem.writeWord(heapPtrAddr, newHeapPointerVal);
                break;
            case 10:
                return true; // halt
            default:
                throw new MIPSError("invalid syscall code", RuntimeErrorCode.INVALID_SYSCALL_CODE);
        }
        regs.advancePC();
    },
    parser: () => <Word>byte.makeFalseArray(28).concat([true, true, false, false])
});

// generates a software interrupt
export const break0 = new Instruction({
    name: "BREAK",
    pattern: "0000 0000 0000 0000 0000 0000 0000 1101",
    execute: (itrn: Word, mem: Memory, regs: Registers) => {
        throw new MIPSError(`break instruction is not implemented yet, at 0x${byte.wordToHexString(regs.getVal(REG.PC))}`, RuntimeErrorCode.NOT_YET_IMPLEMENTED);
    },
    parser: () => <Word>byte.makeFalseArray(28).concat([true, true, false, true])
});

export const nameMap = makeInstructionNameMap([noop, syscall, break0]);
