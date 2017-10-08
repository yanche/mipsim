
import * as assert from "assert";
import { Instruction } from "../def";
import Memory from "../../memory";
import { Registers, REG } from "../../registers";
import { byte } from "../../utility";
import { Word } from "../../def";

export function singleInstructionTest(inst: Instruction, comp: string, regsUnsignedValues: {
    regNum: REG;
    valToSet: number;
    valToTest: number;
}[], haltAfter: boolean = false, instAddr: number = 0, labelMap: Map<string, number> = new Map<string, number>()): void {
    const regs = new Registers();
    for (let r of regsUnsignedValues) {
        if (r.valToSet !== undefined) {
            regs.setVal(r.regNum, <Word>byte.bitsNumFill(byte.numToBits(r.valToSet), 32, false));
        }
    }
    const halt = inst.execute(inst.parse(comp, instAddr, labelMap), new Memory(), regs);
    for (let r of regsUnsignedValues) {
        if (r.valToTest !== undefined) {
            assert.strictEqual(byte.bitsToNum(regs.getVal(r.regNum), false), r.valToTest, `register value not expected: ${REG[r.regNum]}`);
        }
    }
    assert.strictEqual(halt, haltAfter, "halt status not expected");
}
