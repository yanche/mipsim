
import { mfhi, mflo } from "../../move";
import { singleInstructionTest } from "../util";
import { REG } from "../../../registers";

describe("mfhi test", () => {
    it("mfhi $t0", () => {
        const val = parseInt("0x12345678");
        singleInstructionTest(mfhi, "$t0", [
            [REG.PC, 4, 8],
            [REG.HI, val, val],
            [REG.T0, 0, val],
        ]);
    });
});

describe("mflo test", () => {
    it("mflo $t0", () => {
        const val = parseInt("0x12345678");
        singleInstructionTest(mflo, "$t0", [
            [REG.PC, 4, 8],
            [REG.LO, val, val],
            [REG.T0, 0, val],
        ]);
    });
});
