
import * as assert from "assert";
import { addu } from "../arithmetic";
import { singleInstructionTest } from "./util";
import { REG } from "../../registers";

describe("addu test", () => {
    it("1 + 2 = 3", () => {
        // $t0 = $t1 + $t2
        singleInstructionTest(addu, "$t0 $t1 $t2", [
            {
                regNum: REG.PC,
                valToSet: 4,
                valToTest: 8
            },
            {
                regNum: REG.T0,
                valToSet: 0,
                valToTest: 3
            },
            {
                regNum: REG.T1,
                valToSet: 1,
                valToTest: 1
            },
            {
                regNum: REG.T2,
                valToSet: 2,
                valToTest: 2
            }
        ]);
    });
    
    it("0xFFFFFFFF + 1 = 0", () => {
        // $t0 = $t1 + $t2
        singleInstructionTest(addu, "$t0 $t1 $t2", [
            {
                regNum: REG.PC,
                valToSet: 4,
                valToTest: 8
            },
            {
                regNum: REG.T0,
                valToSet: 0,
                valToTest: 0
            },
            {
                regNum: REG.T1,
                valToSet: Math.pow(2, 32) - 1,
                valToTest: Math.pow(2, 32) - 1
            },
            {
                regNum: REG.T2,
                valToSet: 1,
                valToTest: 1
            }
        ]);
    });
    
    it("0xFFFFFFFF + 0xFFFFFFFF = 0xFFFFFFFE", () => {
        // $t0 = $t1 + $t2
        singleInstructionTest(addu, "$t0 $t1 $t2", [
            {
                regNum: REG.PC,
                valToSet: 4,
                valToTest: 8
            },
            {
                regNum: REG.T0,
                valToSet: 0,
                valToTest: Math.pow(2, 32) - 2
            },
            {
                regNum: REG.T1,
                valToSet: Math.pow(2, 32) - 1,
                valToTest: Math.pow(2, 32) - 1
            },
            {
                regNum: REG.T2,
                valToSet: Math.pow(2, 32) - 1,
                valToTest: Math.pow(2, 32) - 1
            }
        ]);
    });
});
