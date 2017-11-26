
import { sb, sw } from "../../store";
import { singleInstructionTest } from "../util";
import { REG } from "../../../registers";
import { SyntaxErrorCode, RuntimeErrorCode } from "../../../error";

describe("sb test", () => {
    it("sb $t0, 0($t1)", () => {
        const addr = "0x00400000";
        const addrNum = parseInt(addr);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(sb, "$t0, 0($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, valNum, valNum],
            [REG.T1, addrNum, addrNum],
            [addr, 0, 40 << 24], // big endian
        ]);
    });

    it("sb $t0, 2($t1)", () => {
        const addr = "0x00400000";
        const addrNum = parseInt(addr);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(sb, "$t0, 2($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, valNum, valNum],
            [REG.T1, addrNum, addrNum],
            [addr, 0, 40 << 8], // big endian
        ]);
    });

    it("sb $t0, -1($t1)", () => {
        const addr = "0x00400000";
        const addr2 = "0x00400004";
        const addrNum2 = parseInt(addr2);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(sb, "$t0, -1($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, valNum, valNum],
            [REG.T1, addrNum2, addrNum2],
            [addr, 0, 40], // big endian
        ]);
    });

    it("sb $t0, 65535($t1), 65535 will be treated as -1", () => {
        const addr = "0x00400000";
        const addr2 = "0x00400004";
        const addrNum2 = parseInt(addr2);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(sb, "$t0, 65535($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, valNum, valNum],
            [REG.T1, addrNum2, addrNum2],
            [addr, 0, 40], // big endian
        ]);
    });

    it("sb $t0, 65536($t1), encoding 65536 throws error", () => {
        singleInstructionTest(sb, "$t0, 65536($t1)", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("sb $t0, -32769($t1), encoding -32769 throws error", () => {
        singleInstructionTest(sb, "$t0, -32769($t1)", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});

describe("sw test", () => {
    it("sw $t0, 0($t1)", () => {
        const addr = "0x00400000";
        const addrNum = parseInt(addr);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(sw, "$t0, 0($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, valNum, valNum],
            [REG.T1, addrNum, addrNum],
            [addr, 0, valNum], // big endian
        ]);
    });

    it("sw $t0, 4($t1)", () => {
        const addr = "0x00400000";
        const addrNum = parseInt(addr);
        const addr2 = "0x00400004";
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(sw, "$t0, 4($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, valNum, valNum],
            [REG.T1, addrNum, addrNum],
            [addr2, 0, valNum], // big endian
        ]);
    });

    it("sw $t0, -4($t1)", () => {
        const addr = "0x00400000";
        const addr2 = "0x00400004";
        const addrNum2 = parseInt(addr2);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(sw, "$t0, -4($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, valNum, valNum],
            [REG.T1, addrNum2, addrNum2],
            [addr, 0, valNum], // big endian
        ]);
    });

    it("sw $t0, 65532($t1), 65535 will be treated as -4", () => {
        const addr = "0x00400000";
        const addr2 = "0x00400004";
        const addrNum2 = parseInt(addr2);
        const val = "0x25262728";
        const valNum = parseInt(val);
        singleInstructionTest(sw, "$t0, 65532($t1)", [
            [REG.PC, 4, 8],
            [REG.T0, valNum, valNum],
            [REG.T1, addrNum2, addrNum2],
            [addr, 0, valNum], // big endian
        ]);
    });

    it("sw $t0, 2($t1), unaligned memory address exception", () => {
        const addr = "0x00400004";
        const addrNum = parseInt(addr);
        singleInstructionTest(sw, "$t0, 2($t1)", [
            [REG.T1, addrNum, addrNum],
        ], RuntimeErrorCode.UNALIGNED_MEM_ACCESS);
    });

    it("sw $t0, -2($t1), unaligned memory address exception", () => {
        const addr = "0x00400004";
        const addrNum = parseInt(addr);
        singleInstructionTest(sw, "$t0, -2($t1)", [
            [REG.T1, addrNum, addrNum],
        ], RuntimeErrorCode.UNALIGNED_MEM_ACCESS);
    });

    it("sw $t0, 65536($t1), encoding 65536 throws error", () => {
        singleInstructionTest(sw, "$t0, 65536($t1)", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("sw $t0, -32769($t1), encoding -32769 throws error", () => {
        singleInstructionTest(sw, "$t0, -32769($t1)", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});
