
import * as assert from "assert";
import { addu, subu } from "../arithmetic";
import { singleInstructionTest, getRegBitStr, testWordWithBitString } from "./util";
import { REG, getRegNumber } from "../../registers";
import { byte } from "../../utility";

describe("addu test", () => {
    it("1 + 2 = 3", () => {
        // $t0 = $t1 + $t2
        // addu $t0 $t1 $t2
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

describe("subu test", () => {
    it("3 - 2 = 1", () => {
        // $t0 = $t1 - $t2
        // subu $t0 $t1 $t2
        singleInstructionTest(subu, "$t0 $t1 $t2", [
            {
                regNum: REG.PC,
                valToSet: 4,
                valToTest: 8
            },
            {
                regNum: REG.T0,
                valToSet: 0,
                valToTest: 1
            },
            {
                regNum: REG.T1,
                valToSet: 3,
                valToTest: 3
            },
            {
                regNum: REG.T2,
                valToSet: 2,
                valToTest: 2
            }
        ]);
    });
});

describe("parsing", () => {
    // $t0 = $t1 + $t2
    // addu $t0 $t1 $t2
    // addu $d, $s, $t
    it("addu $t0 $t1 $t2", () => {
        testWordWithBitString(addu.parse("$t0 $t1 $t2", 0, null), `000000${getRegBitStr("t1")}${getRegBitStr("t2")}${getRegBitStr("t0")}00000100001`);
    });
});
