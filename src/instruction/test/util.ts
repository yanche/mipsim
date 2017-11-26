
import * as assert from "assert";
import { Instruction } from "../def";
import Memory from "../../memory";
import { Registers, REG, getRegNumber } from "../../registers";
import { byte } from "../../utility";
import { Word, Bit } from "../../def";
import { MIPSError } from "../../error";

export function singleInstructionTest(inst: Instruction, comp: string, regValues: [REG | string, number, number][], errcode: number, instAddr?: number, labelMap?: Map<string, number>): void;
export function singleInstructionTest(inst: Instruction, comp: string, regValues: [REG | string, number, number][], haltAfter?: boolean, instAddr?: number, labelMap?: Map<string, number>): void;
export function singleInstructionTest(inst: Instruction, comp: string, regValues: [REG | string, number, number][], haltAfterOrErrCode?: boolean | number, instAddr: number = 0, labelMap: Map<string, number> = new Map<string, number>()): void {
    if (haltAfterOrErrCode === undefined) {
        haltAfterOrErrCode = false;
    }
    const regs = new Registers();
    const mem = new Memory();
    for (let r of regValues) {
        const locator = r[0];
        if (r[1] !== undefined) {
            const bitsVal = <Word>byte.bitsNumFill(byte.numToBits(r[1]).result, 33, true).bits.slice(1);
            if (typeof locator === "string") {
                const addr = <Word>byte.bitsNumFill(byte.numToBits(parseInt(locator)).result, 33, false).bits.slice(1);
                mem.writeWord(addr, bitsVal);
            } else {
                regs.setVal(locator, bitsVal);
            }
        }
    }
    if (typeof haltAfterOrErrCode === "number") {
        try {
            inst.execute(inst.parse(comp, instAddr, labelMap), mem, regs);
            assert.ok(false, `receive no error when error with code: ${haltAfterOrErrCode} is expected`);
        }
        catch (err) {
            if (err instanceof MIPSError && err.errcode === haltAfterOrErrCode) {
                assert.ok(true, `received expected error code: ${err.errcode}`);
            } else {
                assert.ok(false, `unexpected error: ${err}`);
            }
        }
    } else {
        const halt = inst.execute(inst.parse(comp, instAddr, labelMap), mem, regs);
        for (let r of regValues) {
            const locator = r[0];
            if (r[2] !== undefined) {
                let actualWord: Word;
                if (typeof locator === "string") {
                    const addr = <Word>byte.bitsNumFill(byte.numToBits(parseInt(locator)).result, 33, false).bits.slice(1);
                    actualWord = mem.readWord(addr);
                } else {
                    actualWord = regs.getVal(locator);
                }
                const actual = byte.wordToHexString(actualWord);
                const expected = byte.wordToHexString(<Word>byte.bitsNumFill(byte.numToBits(r[2]).result, 33, true).bits.slice(1));
                assert.strictEqual(actual, expected, `${typeof locator === "string" ? "memory" : "register"} value not expected: ${typeof locator === "string" ? locator : REG[locator]}, actual: 0x${actual}, expected: 0x${expected}`);
            }
        }
        assert.strictEqual(halt, haltAfterOrErrCode, "halt status not expected");
    }
}

export function stringifyBits(bits: Bit[]): string {
    return bits.map(d => d ? "1" : "0").join("");
}

export function getRegBitStr(regname: string): string {
    return stringifyBits(byte.bitsNumFill(byte.numToBits(getRegNumber(regname)).result, 5, false).bits);
}

export function testWordWithBitString(word: Word, bitsString: string): void {
    assert.strictEqual(bitsString, stringifyBits(word));
}
