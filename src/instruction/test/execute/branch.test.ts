
import { beq, bgez, bgezal, bgtz, blez, bltz, bltzal, bne } from "../../branch";
import { singleInstructionTest } from "../util";
import { REG } from "../../../registers";

describe("beq test", () => {
    it("beq 1, 1, label", () => {
        singleInstructionTest(beq, "$t0, $t1, label", [
            [REG.PC, 4, 20],
            [REG.T0, 1, 1],
            [REG.T1, 1, 1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("beq 1, 2, label", () => {
        singleInstructionTest(beq, "$t0, $t1, label", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 1],
            [REG.T1, 2, 2],
        ], false, 4, new Map<string, number>().set("label", 20));
    });
});

describe("bgez test", () => {
    it("bgez 1, label", () => {
        singleInstructionTest(bgez, "$t0, label", [
            [REG.PC, 4, 20],
            [REG.T0, 1, 1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("bgez 0, label", () => {
        singleInstructionTest(bgez, "$t0, label", [
            [REG.PC, 4, 20],
            [REG.T0, 0, 0],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("bgez -1, label", () => {
        singleInstructionTest(bgez, "$t0, label", [
            [REG.PC, 4, 8],
            [REG.T0, -1, -1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });
});

describe("bgezal test", () => {
    it("bgezal 1, label", () => {
        singleInstructionTest(bgezal, "$t0, label", [
            [REG.PC, 4, 20],
            [REG.RA, 0, 8],
            [REG.T0, 1, 1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("bgezal 0, label", () => {
        singleInstructionTest(bgezal, "$t0, label", [
            [REG.PC, 4, 20],
            [REG.RA, 0, 8],
            [REG.T0, 0, 0],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("bgezal -1, label", () => {
        singleInstructionTest(bgezal, "$t0, label", [
            [REG.PC, 4, 8],
            [REG.RA, 0, 0],
            [REG.T0, -1, -1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });
});

describe("bgtz test", () => {
    it("bgtz 1, label", () => {
        singleInstructionTest(bgtz, "$t0, label", [
            [REG.PC, 4, 20],
            [REG.T0, 1, 1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("bgtz 0, label", () => {
        singleInstructionTest(bgtz, "$t0, label", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("bgtz -1, label", () => {
        singleInstructionTest(bgtz, "$t0, label", [
            [REG.PC, 4, 8],
            [REG.T0, -1, -1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });
});

describe("blez test", () => {
    it("blez 1, label", () => {
        singleInstructionTest(blez, "$t0, label", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("blez 0, label", () => {
        singleInstructionTest(blez, "$t0, label", [
            [REG.PC, 4, 20],
            [REG.T0, 0, 0],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("blez -1, label", () => {
        singleInstructionTest(blez, "$t0, label", [
            [REG.PC, 4, 20],
            [REG.T0, -1, -1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });
});

describe("bltz test", () => {
    it("bltz 1, label", () => {
        singleInstructionTest(bltz, "$t0, label", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("bltz 0, label", () => {
        singleInstructionTest(bltz, "$t0, label", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("bltz -1, label", () => {
        singleInstructionTest(bltz, "$t0, label", [
            [REG.PC, 4, 20],
            [REG.T0, -1, -1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });
});

describe("bltzal test", () => {
    it("bltzal 1, label", () => {
        singleInstructionTest(bltzal, "$t0, label", [
            [REG.PC, 4, 8],
            [REG.RA, 0, 0],
            [REG.T0, 1, 1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("bltzal 0, label", () => {
        singleInstructionTest(bltzal, "$t0, label", [
            [REG.PC, 4, 8],
            [REG.RA, 0, 0],
            [REG.T0, 0, 0],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("bltzal -1, label", () => {
        singleInstructionTest(bltzal, "$t0, label", [
            [REG.PC, 4, 20],
            [REG.RA, 0, 8],
            [REG.T0, -1, -1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });
});

describe("bne test", () => {
    it("bne 1, 1, label", () => {
        singleInstructionTest(bne, "$t0, $t1, label", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 1],
            [REG.T1, 1, 1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("bne 0, 1, label", () => {
        singleInstructionTest(bne, "$t0, $t1, label", [
            [REG.PC, 4, 20],
            [REG.T0, 0, 0],
            [REG.T1, 1, 1],
        ], false, 4, new Map<string, number>().set("label", 20));
    });
});
