
import * as assert from "assert";
import { Instruction } from "../def";
import Memory from "../../memory";
import { Registers, REG, getRegNumber } from "../../registers";
import { byte } from "../../utility";
import { Word, Bit } from "../../def";
import { MIPSError } from "../../error";

export function singleInstructionTest(inst: Instruction, comp: string, regValues: [REG, number, number][], errcode: number, instAddr?: number, labelMap?: Map<string, number>): void;
export function singleInstructionTest(inst: Instruction, comp: string, regValues: [REG, number, number][], haltAfter?: boolean, instAddr?: number, labelMap?: Map<string, number>): void;
export function singleInstructionTest(inst: Instruction, comp: string, regValues: [REG, number, number][], haltAfterOrErrCode?: boolean | number, instAddr: number = 0, labelMap: Map<string, number> = new Map<string, number>()): void {
    if (haltAfterOrErrCode === undefined) {
        haltAfterOrErrCode = false;
    }
    const regs = new Registers();
    for (let r of regValues) {
        if (r[1] !== undefined) {
            regs.setVal(r[0], <Word>byte.bitsNumFill(byte.numToBits(r[1]).result, 33, true).bits.slice(1));
        }
    }
    if (typeof haltAfterOrErrCode === "number") {
        try {
            inst.execute(inst.parse(comp, instAddr, labelMap), new Memory(), regs);
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
        const halt = inst.execute(inst.parse(comp, instAddr, labelMap), new Memory(), regs);
        for (let r of regValues) {
            if (r[2] !== undefined) {
                const expected = byte.wordToHexString(<Word>byte.bitsNumFill(byte.numToBits(r[2]).result, 33, true).bits.slice(1));
                const actual = byte.wordToHexString(regs.getVal(r[0]));
                assert.strictEqual(actual, expected, `register value not expected: ${REG[r[0]]}, actual: 0x${actual}, expected: 0x${expected}`);
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
