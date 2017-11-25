
import { slt, sltu, slti, sltiu } from "../../comparison";
import { singleInstructionTest } from "../util";
import { REG } from "../../../registers";
import { SyntaxErrorCode } from "../../../error";

describe("slt test", () => {
    it("slt $d, 1, 1", () => {
        singleInstructionTest(slt, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 1, 1],
            [REG.T2, 1, 1],
        ]);
    });

    it("slt $d, 1, 2", () => {
        singleInstructionTest(slt, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
            [REG.T2, 2, 2],
        ]);
    });

    it("slt $d, 2, 1", () => {
        singleInstructionTest(slt, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 2, 2],
            [REG.T2, 1, 1],
        ]);
    });

    it("slt $d, -1, 1", () => {
        singleInstructionTest(slt, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, -1, -1],
            [REG.T2, 1, 1],
        ]);
    });
});

describe("sltu test", () => {
    it("sltu $d, 1, 1", () => {
        singleInstructionTest(sltu, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 1, 1],
            [REG.T2, 1, 1],
        ]);
    });

    it("sltu $d, 1, 2", () => {
        singleInstructionTest(sltu, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
            [REG.T2, 2, 2],
        ]);
    });

    it("sltu $d, 2, 1", () => {
        singleInstructionTest(sltu, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 2, 2],
            [REG.T2, 1, 1],
        ]);
    });

    it("sltu $d, -1, 1", () => {
        singleInstructionTest(sltu, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, -1, -1],
            [REG.T2, 1, 1],
        ]);
    });
});

describe("slti test", () => {
    it("slti $d, 1, 1(IMM)", () => {
        singleInstructionTest(slti, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 1, 1],
        ]);
    });

    it("slti $d, 1, 2(IMM)", () => {
        singleInstructionTest(slti, "$t0, $t1, 2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
        ]);
    });

    it("slti $d, 2, 1(IMM)", () => {
        singleInstructionTest(slti, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 2, 2],
        ]);
    });

    it("slti $d, -1, 1(IMM)", () => {
        singleInstructionTest(slti, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, -1, -1],
        ]);
    });

    it("slti $d, 1, -1(IMM)", () => {
        singleInstructionTest(slti, "$t0, $t1, -1", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 1, 1],
        ]);
    });

    it("slti $d, 1, 65535(IMM), 65535 will be treated as -1", () => {
        singleInstructionTest(slti, "$t0, $t1, 65535", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 1, 1],
        ]);
    });

    it("encoding 65536 throws error", () => {
        singleInstructionTest(slti, "$t0, $t1, 65536", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("encoding -32769 throws error", () => {
        singleInstructionTest(slti, "$t0, $t1, -32769", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});

describe("sltiu test", () => {
    it("sltiu $d, 1, 1(IMM)", () => {
        singleInstructionTest(sltiu, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 1, 1],
        ]);
    });

    it("sltiu $d, 1, 2(IMM)", () => {
        singleInstructionTest(sltiu, "$t0, $t1, 2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
        ]);
    });

    it("sltiu $d, 2, 1(IMM)", () => {
        singleInstructionTest(sltiu, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 2, 2],
        ]);
    });

    it("sltiu $d, -1, 1(IMM)", () => {
        singleInstructionTest(sltiu, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, -1, -1],
        ]);
    });

    it("sltiu $d, 1, -1(IMM)", () => {
        singleInstructionTest(sltiu, "$t0, $t1, -1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
        ]);
    });

    it("sltiu $d, 1, 65535(IMM)", () => {
        singleInstructionTest(sltiu, "$t0, $t1, 65535", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
        ]);
    });

    it("sltiu $d, 1, -32768(IMM), -32768 will be treated as a huge positive number", () => {
        singleInstructionTest(sltiu, "$t0, $t1, -32768", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
        ]);
    });

    it("encoding 65536 throws error", () => {
        singleInstructionTest(sltiu, "$t0, $t1, 65536", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("encoding -32769 throws error", () => {
        singleInstructionTest(sltiu, "$t0, $t1, -32769", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});
