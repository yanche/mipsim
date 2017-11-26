
import { j, jal, jr } from "../../jump";
import { singleInstructionTest } from "../util";
import { REG } from "../../../registers";
import { SyntaxErrorCode } from "../../../error";

describe("j test", () => {
    it("j label", () => {
        singleInstructionTest(j, "label", [
            [REG.PC, 4, 20],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("j label2", () => {
        singleInstructionTest(j, "label", [
            [REG.PC, 20, 4],
        ], false, 20, new Map<string, number>().set("label", 4));
    });

    it("j label, not overflow", () => {
        const j_addr = parseInt("0x0ffffffc"); // max address can be encoded
        singleInstructionTest(j, "label", [
            [REG.PC, 4, j_addr],
        ], false, 4, new Map<string, number>().set("label", j_addr));
    });

    it("j label, overflow", () => {
        singleInstructionTest(j, "label", [
            [REG.PC, 4, 4],
        ], SyntaxErrorCode.NUM_OVERFLOW, 4, new Map<string, number>().set("label", parseInt("0x10000000")));
    });
});

describe("jal test", () => {
    it("jal label", () => {
        singleInstructionTest(jal, "label", [
            [REG.PC, 4, 20],
            [REG.RA, 0, 8],
        ], false, 4, new Map<string, number>().set("label", 20));
    });

    it("jal label2", () => {
        singleInstructionTest(jal, "label", [
            [REG.PC, 20, 4],
            [REG.RA, 0, 24],
        ], false, 20, new Map<string, number>().set("label", 4));
    });

    it("jal label, not overflow", () => {
        const j_addr = parseInt("0x0ffffffc"); // max address can be encoded
        singleInstructionTest(jal, "label", [
            [REG.PC, 4, j_addr],
        ], false, 4, new Map<string, number>().set("label", j_addr));
    });

    it("jal label, overflow", () => {
        singleInstructionTest(jal, "label", [
            [REG.PC, 4, 4],
        ], SyntaxErrorCode.NUM_OVERFLOW, 4, new Map<string, number>().set("label", parseInt("0x10000000")));
    });
});

describe("jr test", () => {
    it("jr label", () => {
        singleInstructionTest(jr, "$t0", [
            [REG.PC, 4, 20],
            [REG.T0, 20, 20],
        ]);
    });
});
