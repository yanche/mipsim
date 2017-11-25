
import { addu, addiu, and, andi, divu, div, multu, mult, or, ori, sll, sllv, sra, srl, srlv, subu, xor, xori } from "../../arithmetic";
import { singleInstructionTest } from "../util";
import { REG } from "../../../registers";
import { SyntaxErrorCode } from "../../../error";

describe("addu test", () => {
    it("1 + 2 = 3", () => {
        singleInstructionTest(addu, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 3],
            [REG.T1, 1, 1],
            [REG.T2, 2, 2],
        ]);
    });

    it("0xFFFFFFFF + 1 = 0", () => {
        singleInstructionTest(addu, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
            [REG.T1, -1, -1],
            [REG.T2, 1, 1],
        ]);
    });

    it("0xFFFFFFFF + 0xFFFFFFFF = 0xFFFFFFFE", () => {
        singleInstructionTest(addu, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, -2],
            [REG.T1, -1, -1],
            [REG.T2, -1, -1],
        ]);
    });
});

describe("addiu test", () => {
    it("1 + 2(IMM) = 3", () => {
        singleInstructionTest(addiu, "$t0, $t1, 2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 3],
            [REG.T1, 1, 1],
        ]);
    });

    it("0xFFFFFFFF + 1(IMM) = 0", () => {
        singleInstructionTest(addiu, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
            [REG.T1, -1, -1],
        ]);
    });

    it("0xFFFFFFFF + 0xFFFF(IMM) = 0xFFFFFFFE", () => {
        singleInstructionTest(addiu, "$t0, $t1, -1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, -2],
            [REG.T1, -1, -1],
        ]);
    });

    it("1 + -32768(IMM) = -32767", () => {
        singleInstructionTest(addiu, "$t0, $t1, -32768", [
            [REG.PC, 4, 8],
            [REG.T0, 0, -32767],
            [REG.T1, 1, 1],
        ]);
    });

    it("2 + 65535(IMM) = 1, 65535 will be treated as -1", () => {
        singleInstructionTest(addiu, "$t0, $t1, 65535", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 2, 2],
        ]);
    });

    it("encoding 65536 throws error", () => {
        singleInstructionTest(addiu, "$t0, $t1, 65536", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("encoding -32769 throws error", () => {
        singleInstructionTest(addiu, "$t0, $t1, -32769", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});

describe("and test", () => {
    it("1 & 2 = 0", () => {
        singleInstructionTest(and, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
            [REG.T1, 1, 1],
            [REG.T2, 2, 2],
        ]);
    });

    it("1 & 1 = 1", () => {
        singleInstructionTest(and, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
            [REG.T2, 1, 1],
        ]);
    });
});

describe("andi test", () => {
    it("1 & 2(IMM) = 0", () => {
        singleInstructionTest(andi, "$t0, $t1, 2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
            [REG.T1, 1, 1],
        ]);
    });

    it("1 & 1(IMM) = 1", () => {
        singleInstructionTest(andi, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
        ]);
    });

    it("0xFFFFFFFF & 0xFFFF(IMM) = 0x0000FFFF", () => {
        singleInstructionTest(andi, "$t0, $t1, -1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 65535],
            [REG.T1, -1, -1],
        ]);
    });

    it("0xFFFFFFFF & 65535(IMM) = 0x0000FFFF", () => {
        singleInstructionTest(andi, "$t0, $t1, 65535", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 65535],
            [REG.T1, -1, -1],
        ]);
    });

    it("encoding 65536 throws error", () => {
        singleInstructionTest(andi, "$t0, $t1, 65536", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("encoding -32769 throws error", () => {
        singleInstructionTest(andi, "$t0, $t1, -32769", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});

describe("divu test", () => {
    it("1 / 1 = 1, 0", () => {
        singleInstructionTest(divu, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 1],
            [REG.T1, 1, 1],
            [REG.LO, 0, 1], // quotient
            [REG.HI, 0, 0], // remainder
        ]);
    });

    it("5 / 2 = 2, 1", () => {
        singleInstructionTest(divu, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 5, 5],
            [REG.T1, 2, 2],
            [REG.LO, 0, 2], // quotient
            [REG.HI, 0, 1], // remainder
        ]);
    });

    // in divu the -5 will be treated as a huge positive integer
    it("-5 / 2 = 0x7ffffffd, 1", () => {
        singleInstructionTest(divu, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, -5, -5],
            [REG.T1, 2, 2],
            [REG.LO, 0, parseInt("0x7ffffffd")], // quotient
            [REG.HI, 0, 1], // remainder
        ]);
    });

    it("0 / 5 = 0, 0", () => {
        singleInstructionTest(divu, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
            [REG.T1, 5, 5],
            [REG.LO, 0, 0], // quotient
            [REG.HI, 0, 0], // remainder
        ]);
    });

    it("5 / 0 does not raise error, like a NOOP", () => {
        singleInstructionTest(divu, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 5, 5],
            [REG.T1, 0, 0],
            [REG.LO, 2, 2], // quotient register does not change
            [REG.HI, 2, 2], // remainder register does not change
        ]);
    });
});

describe("div test", () => {
    it("1 / 1 = 1, 0", () => {
        singleInstructionTest(div, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 1],
            [REG.T1, 1, 1],
            [REG.LO, 0, 1], // quotient
            [REG.HI, 0, 0], // remainder
        ]);
    });

    it("5 / 2 = 2, 1", () => {
        singleInstructionTest(div, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 5, 5],
            [REG.T1, 2, 2],
            [REG.LO, 0, 2], // quotient
            [REG.HI, 0, 1], // remainder
        ]);
    });

    it("-5 / 2 = -2, -1", () => {
        singleInstructionTest(div, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, -5, -5],
            [REG.T1, 2, 2],
            [REG.LO, 0, -2], // quotient
            [REG.HI, 0, -1], // remainder
        ]);
    });

    it("-5 / -2 = 2, -1", () => {
        singleInstructionTest(div, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, -5, -5],
            [REG.T1, -2, -2],
            [REG.LO, 0, 2], // quotient
            [REG.HI, 0, -1], // remainder
        ]);
    });

    it("5 / -2 = -2, 1", () => {
        singleInstructionTest(div, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 5, 5],
            [REG.T1, -2, -2],
            [REG.LO, 0, -2], // quotient
            [REG.HI, 0, 1], // remainder
        ]);
    });

    it("0 / 5 = 0, 0", () => {
        singleInstructionTest(div, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
            [REG.T1, 5, 5],
            [REG.LO, 0, 0], // quotient
            [REG.HI, 0, 0], // remainder
        ]);
    });

    it("5 / 0 does not raise error, like a NOOP", () => {
        singleInstructionTest(div, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 5, 5],
            [REG.T1, 0, 0],
            [REG.LO, 2, 2], // quotient register does not change
            [REG.HI, 2, 2], // remainder register does not change
        ]);
    });
});

describe("multu test", () => {
    it("2 * 3 = 6", () => {
        singleInstructionTest(multu, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 2, 2],
            [REG.T1, 3, 3],
            [REG.LO, 0, 6],
            [REG.HI, 0, 0],
        ]);
    });

    it("2 * -1 = 2 * (2^32 - 1)", () => {
        singleInstructionTest(multu, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 2, 2],
            [REG.T1, -1, -1],
            [REG.LO, 0, -2],
            [REG.HI, 0, 1],
        ]);
    });

    it("-1 * -1 = (2^32 - 1) * (2^32 - 1)", () => {
        singleInstructionTest(multu, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, -1, -1],
            [REG.T1, -1, -1],
            [REG.LO, 0, 1],
            [REG.HI, 0, -2], //0xfffe
        ]);
    });
});

describe("mult test", () => {
    it("2 * 3 = 6", () => {
        singleInstructionTest(mult, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 2, 2],
            [REG.T1, 3, 3],
            [REG.LO, 0, 6],
            [REG.HI, 0, 0],
        ]);
    });

    it("-2 * 3 = -6", () => {
        singleInstructionTest(mult, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, -2, -2],
            [REG.T1, 3, 3],
            [REG.LO, 0, -6],
            [REG.HI, 0, -1],
        ]);
    });

    it("-2 * -3 = 6", () => {
        singleInstructionTest(mult, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, -2, -2],
            [REG.T1, -3, -3],
            [REG.LO, 0, 6],
            [REG.HI, 0, 0],
        ]);
    });

    it("2 * -3 = -6", () => {
        singleInstructionTest(mult, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 2, 2],
            [REG.T1, -3, -3],
            [REG.LO, 0, -6],
            [REG.HI, 0, -1],
        ]);
    });

    it("2 * -3 = -6", () => {
        singleInstructionTest(mult, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, 2, 2],
            [REG.T1, -3, -3],
            [REG.LO, 0, -6],
            [REG.HI, 0, -1],
        ]);
    });

    it("(2^31 - 1) * (2^31 - 1)", () => {
        singleInstructionTest(mult, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, parseInt("0x7fffffff"), parseInt("0x7fffffff")],
            [REG.T1, parseInt("0x7fffffff"), parseInt("0x7fffffff")],
            [REG.LO, 0, 1],
            [REG.HI, 0, parseInt("0x3fffffff")],
        ]);
    });

    it("(2^31 - 1) * -2^31", () => {
        singleInstructionTest(mult, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, parseInt("0x7fffffff"), parseInt("0x7fffffff")],
            [REG.T1, parseInt("0x80000000"), parseInt("0x80000000")],
            [REG.LO, 0, parseInt("0x80000000")],
            [REG.HI, 0, parseInt("0xc0000000")],
        ]);
    });

    it("-2^31 * -2^31", () => {
        singleInstructionTest(mult, "$t0, $t1", [
            [REG.PC, 4, 8],
            [REG.T0, parseInt("0x80000000"), parseInt("0x80000000")],
            [REG.T1, parseInt("0x80000000"), parseInt("0x80000000")],
            [REG.LO, 0, 0],
            [REG.HI, 0, parseInt("0x40000000")],
        ]);
    });
});

describe("or test", () => {
    it("1 | 2 = 3", () => {
        singleInstructionTest(or, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 3],
            [REG.T1, 1, 1],
            [REG.T2, 2, 2],
        ]);
    });

    it("1 | 1 = 1", () => {
        singleInstructionTest(or, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
            [REG.T2, 1, 1],
        ]);
    });
});

describe("ori test", () => {
    it("1 | 2(IMM) = 3", () => {
        singleInstructionTest(ori, "$t0, $t1, 2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 3],
            [REG.T1, 1, 1],
        ]);
    });

    it("1 | 1(IMM) = 1", () => {
        singleInstructionTest(ori, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
        ]);
    });

    it("0xFFFFFFFF & 0xFFFF(IMM) = 0xFFFFFFFF", () => {
        singleInstructionTest(ori, "$t0, $t1, -1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, -1],
            [REG.T1, -1, -1],
        ]);
    });

    it("0xFFFFFFFF & 65535(IMM) = 0xFFFFFFFF", () => {
        singleInstructionTest(ori, "$t0, $t1, 65535", [
            [REG.PC, 4, 8],
            [REG.T0, 0, -1],
            [REG.T1, -1, -1],
        ]);
    });

    it("encoding 65536 throws error", () => {
        singleInstructionTest(ori, "$t0, $t1, 65536", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("encoding -32769 throws error", () => {
        singleInstructionTest(ori, "$t0, $t1, -32769", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});

describe("sll test", () => {
    it("1 << 0 = 1", () => {
        singleInstructionTest(sll, "$t0, $t1, 0", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
        ]);
    });

    it("1 << 1 = 2", () => {
        singleInstructionTest(sll, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 2],
            [REG.T1, 1, 1],
        ]);
    });

    it("5 << 3 = 40", () => {
        singleInstructionTest(sll, "$t0, $t1, 3", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 40],
            [REG.T1, 5, 5],
        ]);
    });

    it("5 << 31 = 2^31", () => {
        singleInstructionTest(sll, "$t0, $t1, 31", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0x80000000")],
            [REG.T1, 5, 5],
        ]);
    });

    it("2 << 31 = 0", () => {
        singleInstructionTest(sll, "$t0, $t1, 31", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
            [REG.T1, 2, 2],
        ]);
    });

    it("2 << -16 = 0x00020000, -16 will be treated as 16 when encoded into 5 bits integer", () => {
        singleInstructionTest(sll, "$t0, $t1, -16", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0x00020000")],
            [REG.T1, 2, 2],
        ]);
    });

    it("encoding 32 throws error", () => {
        singleInstructionTest(sll, "$t0, $t1, 32", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("encoding -17 throws error", () => {
        singleInstructionTest(sll, "$t0, $t1, -17", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});

describe("sllv test", () => {
    it("1 << 0 = 1", () => {
        singleInstructionTest(sllv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
            [REG.T2, 0, 0],
        ]);
    });

    it("1 << 1 = 2", () => {
        singleInstructionTest(sllv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 2],
            [REG.T1, 1, 1],
            [REG.T2, 1, 1],
        ]);
    });

    it("5 << 3 = 40", () => {
        singleInstructionTest(sllv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 40],
            [REG.T1, 5, 5],
            [REG.T2, 3, 3],
        ]);
    });

    it("5 << 31 = 2^31", () => {
        singleInstructionTest(sllv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0x80000000")],
            [REG.T1, 5, 5],
            [REG.T2, 31, 31],
        ]);
    });

    it("2 << 31 = 0", () => {
        singleInstructionTest(sllv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
            [REG.T1, 2, 2],
            [REG.T2, 31, 31],
        ]);
    });

    it("1 << 32 = 0", () => {
        singleInstructionTest(sllv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
            [REG.T1, 1, 1],
            [REG.T2, 32, 32],
        ]);
    });

    it("1 << -1 = 0", () => {
        singleInstructionTest(sllv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
            [REG.T1, 1, 1],
            [REG.T2, -1, -1],
        ]);
    });
});

describe("sra test", () => {
    it("1 >> 0 = 1", () => {
        singleInstructionTest(sra, "$t0, $t1, 0", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
        ]);
    });

    it("1 >> 1 = 0", () => {
        singleInstructionTest(sra, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 1, 1],
        ]);
    });

    it("5 >> 1 = 2", () => {
        singleInstructionTest(sra, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 2],
            [REG.T1, 5, 5],
        ]);
    });

    it("-1 >> 5 = -1", () => {
        singleInstructionTest(sra, "$t0, $t1, 5", [
            [REG.PC, 4, 8],
            [REG.T0, 0, -1],
            [REG.T1, -1, -1],
        ]);
    });

    it("-11 >> 2 = -3", () => {
        singleInstructionTest(sra, "$t0, $t1, 2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, -3],
            [REG.T1, -11, -11],
        ]);
    });

    it("0x40000000 >> -16 = 0x00004000, -16 will be treated as 16 when encoded into 5 bits integer", () => {
        singleInstructionTest(sra, "$t0, $t1, -16", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0x00004000")],
            [REG.T1, parseInt("0x40000000"), parseInt("0x40000000")],
        ]);
    });

    it("encoding 32 throws error", () => {
        singleInstructionTest(sra, "$t0, $t1, 32", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("encoding -17 throws error", () => {
        singleInstructionTest(sra, "$t0, $t1, -17", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});

describe("srl test", () => {
    it("1 >>> 0 = 1", () => {
        singleInstructionTest(srl, "$t0, $t1, 0", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
        ]);
    });

    it("1 >>> 1 = 0", () => {
        singleInstructionTest(srl, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 1, 1],
        ]);
    });

    it("5 >>> 1 = 2", () => {
        singleInstructionTest(srl, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 2],
            [REG.T1, 5, 5],
        ]);
    });

    it("-1 >>> 5 = 0x07ffffff", () => {
        singleInstructionTest(srl, "$t0, $t1, 5", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0x07ffffff")],
            [REG.T1, -1, -1],
        ]);
    });

    it("-11 >>> 2 = 0x3ffffffd", () => {
        singleInstructionTest(srl, "$t0, $t1, 2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0x3ffffffd")],
            [REG.T1, -11, -11],
        ]);
    });

    it("0xf0000000 >>> -16 = 0x0000f000, -16 will be treated as 16 when encoded into 5 bits integer", () => {
        singleInstructionTest(srl, "$t0, $t1, -16", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0x0000f000")],
            [REG.T1, parseInt("0xf0000000"), parseInt("0xf0000000")],
        ]);
    });

    it("encoding 32 throws error", () => {
        singleInstructionTest(srl, "$t0, $t1, 32", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("encoding -17 throws error", () => {
        singleInstructionTest(srl, "$t0, $t1, -17", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});

describe("srlv test", () => {
    it("1 >>> 0 = 1", () => {
        singleInstructionTest(srlv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 1, 1],
            [REG.T2, 0, 0],
        ]);
    });

    it("1 >>> 1 = 0", () => {
        singleInstructionTest(srlv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 1, 1],
            [REG.T2, 1, 1],
        ]);
    });

    it("5 >>> 1 = 2", () => {
        singleInstructionTest(srlv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 2],
            [REG.T1, 5, 5],
            [REG.T2, 1, 1],
        ]);
    });

    it("-1 >>> 5 = 0x07ffffff", () => {
        singleInstructionTest(srlv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0x07ffffff")],
            [REG.T1, -1, -1],
            [REG.T2, 5, 5],
        ]);
    });

    it("-11 >>> 2 = 0x3ffffffd", () => {
        singleInstructionTest(srlv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0x3ffffffd")],
            [REG.T1, -11, -11],
            [REG.T2, 2, 2],
        ]);
    });

    it("-1 >>> 2 = 0", () => {
        singleInstructionTest(srlv, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 0],
            [REG.T1, -1, -1],
            [REG.T2, 32, 32],
        ]);
    });
});

describe("subu test", () => {
    it("3 - 2 = 1", () => {
        singleInstructionTest(subu, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 1],
            [REG.T1, 3, 3],
            [REG.T2, 2, 2],
        ]);
    });

    it("0 - 1 = -1", () => {
        singleInstructionTest(subu, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, -1],
            [REG.T1, 0, 0],
            [REG.T2, 1, 1],
        ]);
    });
});

describe("xor test", () => {
    it("1 ^ 2 = 3", () => {
        singleInstructionTest(xor, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 3],
            [REG.T1, 1, 1],
            [REG.T2, 2, 2],
        ]);
    });

    it("1 ^ 1 = 0", () => {
        singleInstructionTest(xor, "$t0, $t1, $t2", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 1, 1],
            [REG.T2, 1, 1],
        ]);
    });
});

describe("xori test", () => {
    it("1 ^ 2(IMM) = 3", () => {
        singleInstructionTest(xori, "$t0, $t1, 2", [
            [REG.PC, 4, 8],
            [REG.T0, 0, 3],
            [REG.T1, 1, 1],
        ]);
    });

    it("1 ^ 1(IMM) = 0", () => {
        singleInstructionTest(xori, "$t0, $t1, 1", [
            [REG.PC, 4, 8],
            [REG.T0, 1, 0],
            [REG.T1, 1, 1],
        ]);
    });

    it("0xFFFFFFFF ^ 0xFFFF(IMM) = 0xFFFF0000", () => {
        singleInstructionTest(xori, "$t0, $t1, -1", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0xFFFF0000")],
            [REG.T1, -1, -1],
        ]);
    });

    it("0xFFFFFFFF & 65535(IMM) = 0xFFFF0000", () => {
        singleInstructionTest(xori, "$t0, $t1, 65535", [
            [REG.PC, 4, 8],
            [REG.T0, 0, parseInt("0xFFFF0000")],
            [REG.T1, -1, -1],
        ]);
    });

    it("encoding 65536 throws error", () => {
        singleInstructionTest(xori, "$t0, $t1, 65536", [], SyntaxErrorCode.NUM_OVERFLOW);
    });

    it("encoding -32769 throws error", () => {
        singleInstructionTest(xori, "$t0, $t1, -32769", [], SyntaxErrorCode.NUM_OVERFLOW);
    });
});
