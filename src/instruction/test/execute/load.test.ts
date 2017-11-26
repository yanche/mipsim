
import { lb, lui, lw } from "../../load";
import { singleInstructionTest } from "../util";
import { REG } from "../../../registers";
import { SyntaxErrorCode, RuntimeErrorCode } from "../../../error";

describe("lb test", () => {
    it("lb $t0, 0($t1)", () => {
        const addr = "0x00400000";
        const addrNum = parseInt(addr);
        const val = "0x25000000";
        const valNum = parseInt(val);
        singleInstructionTest(lb, "$t0, 0($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 37],
            [REG.T1, addrNum, addrNum],
            [addr, valNum, valNum], // big endian
        ]);
    });

    it("lb $t0, 2($t1)", () => {
        const addr = "0x00400000";
        const addrNum = parseInt(addr);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(lb, "$t0, 2($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 39],
            [REG.T1, addrNum, addrNum],
            [addr, valNum, valNum], // big endian
        ]);
    });

    it("lb $t0, -1($t1)", () => {
        const addr = "0x00400000";
        const addr2 = "0x00400004";
        const addrNum2 = parseInt(addr2);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(lb, "$t0, -1($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 40],
            [REG.T1, addrNum2, addrNum2],
            [addr, valNum, valNum], // big endian
        ]);
    });

    it("lb $t0, 65535($t1), 65535 will be treated as -1", () => {
        const addr = "0x00400000";
        const addr2 = "0x00400004";
        const addrNum2 = parseInt(addr2);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(lb, "$t0, 65535($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 40],
            [REG.T1, addrNum2, addrNum2],
            [addr, valNum, valNum], // big endian
        ]);
    });

    it("lb $t0, 65536($t1), encoding 65536 throws error", () => {
        singleInstructionTest(lb, "$t0, 65536($t1)", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("lb $t0, -32769($t1), encoding -32769 throws error", () => {
        singleInstructionTest(lb, "$t0, -32769($t1)", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});

describe("lui test", () => {
    it("lui $t0, 1", () => {
        singleInstructionTest(lui, "$t0, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0x00010000")],
        ]);
    });

    it("lui $t0, -1", () => {
        singleInstructionTest(lui, "$t0, -1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0xffff0000")],
        ]);
    });
});

describe("lw test", () => {
    it("lw $t0, 0($t1)", () => {
        const addr = "0x00400000";
        const addrNum = parseInt(addr);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(lw, "$t0, 0($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, 0, valNum],
            [REG.T1, addrNum, addrNum],
            [addr, valNum, valNum], // big endian
        ]);
    });

    it("lw $t0, 4($t1)", () => {
        const addr = "0x00400000";
        const addrNum = parseInt(addr);
        const addr2 = "0x00400004";
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(lw, "$t0, 4($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, valNum, valNum],
            [REG.T1, addrNum, addrNum],
            [addr2, valNum, valNum], // big endian
        ]);
    });

    it("lw $t0, -4($t1)", () => {
        const addr = "0x00400000";
        const addr2 = "0x00400004";
        const addrNum2 = parseInt(addr2);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(lw, "$t0, -4($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, valNum, valNum],
            [REG.T1, addrNum2, addrNum2],
            [addr, valNum, valNum], // big endian
        ]);
    });

    it("lw $t0, 65532($t1), 65535 will be treated as -4", () => {
        const addr = "0x00400000";
        const addr2 = "0x00400004";
        const addrNum2 = parseInt(addr2);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(lw, "$t0, 65532($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, valNum, valNum],
            [REG.T1, addrNum2, addrNum2],
            [addr, valNum, valNum], // big endian
        ]);
    });

    it("lw $t0, 2($t1), unaligned memory address exception", () => {
        const addr = "0x00400004";
        const addrNum = parseInt(addr);
        singleInstructionTest(lw, "$t0, 2($t1)", [
            [REG.T1, addrNum, addrNum],
        ], RuntimeErrorCode.UNALIGNED_MEM_ACCESS);
    });

    it("lw $t0, -2($t1), unaligned memory address exception", () => {
        const addr = "0x00400004";
        const addrNum = parseInt(addr);
        singleInstructionTest(lw, "$t0, -2($t1)", [
            [REG.T1, addrNum, addrNum],
        ], RuntimeErrorCode.UNALIGNED_MEM_ACCESS);
    });

    it("lw $t0, 65536($t1), encoding 65536 throws error", () => {
        singleInstructionTest(lw, "$t0, 65536($t1)", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("lw $t0, -32769($t1), encoding -32769 throws error", () => {
        singleInstructionTest(lw, "$t0, -32769($t1)", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});
