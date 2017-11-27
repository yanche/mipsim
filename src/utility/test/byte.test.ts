
import * as assert from "assert";
import * as byte from "../byte";
import { range } from "../index";

describe("numToBits", () => {
    it("16", testNumToBits(16, "010000"));
    it("-16", testNumToBits(-16, "10000"));
    it("10", testNumToBits(10, "01010"));
    it("-10", testNumToBits(-10, "10110"));
    it("0", testNumToBits(0, "0"));
    it("1", testNumToBits(1, "01"));
    it("-1", testNumToBits(-1, "1"));
    it("65535", testNumToBits(65535, "01111111111111111"))
});

describe("twosComplement", () => {
    it("1", testTwosComplement("1", "1"));
    it("000", testTwosComplement("000", "000"));
    it("111", testTwosComplement("111", "001"));
    it("11010010", testTwosComplement("11010010", "00101110"));
});

describe("bitsNumFill", () => {
    it("0xf -> 0x0f", testBitsNumFill("1111", 8, false, "00001111"));
    it("0xf -> 0xff", testBitsNumFill("1111", 8, true, "11111111"));
    it("0x0f -> 0xf", testBitsNumFill("00001111", 4, false, "1111"));
    it("1111 -> 111", testBitsNumFill("1111", 3, true, "111"));
    it("1111 -> 111 raise error for unsigned", testBitsNumFill("1111", 3, false, "1111", true));
    it("0011 -> 11", testBitsNumFill("0011", 2, false, "11"));
    it("0011 -> 011", testBitsNumFill("0011", 3, true, "011"));
    it("0011 -> 11 raise error for signed", testBitsNumFill("0011", 2, true, "0011", true));
});

describe("range", () => {
    it("range(1,5)", testRange([1, 2, 3, 4], 1, 5));
    it("range(5)", testRange([0, 1, 2, 3, 4], 5));
    it("range(1,1)", testRange([], 1, 1));
    it("range(1)", testRange([0], 1));
    it("range(0)", testRange([], 0));
    it("range(5,1)", testRange([], 5, 1, true));
    it("range(-2)", testRange([], -2, undefined, true));
});

describe("bitsFromHexStr", () => {
    it("0x0", testBitsFromHexStr("0x0", "0000"));
    it("0x1", testBitsFromHexStr("0x1", "0001"));
    it("0x2", testBitsFromHexStr("0x2", "0010"));
    it("0x3", testBitsFromHexStr("0x3", "0011"));
    it("0x4", testBitsFromHexStr("0x4", "0100"));
    it("0x5", testBitsFromHexStr("0x5", "0101"));
    it("0x6", testBitsFromHexStr("0x6", "0110"));
    it("0x7", testBitsFromHexStr("0x7", "0111"));
    it("0x8", testBitsFromHexStr("0x8", "1000"));
    it("0x9", testBitsFromHexStr("0x9", "1001"));
    it("0xa", testBitsFromHexStr("0xa", "1010"));
    it("0xb", testBitsFromHexStr("0xb", "1011"));
    it("0xc", testBitsFromHexStr("0xc", "1100"));
    it("0xd", testBitsFromHexStr("0xd", "1101"));
    it("0xe", testBitsFromHexStr("0xe", "1110"));
    it("0xf", testBitsFromHexStr("0xf", "1111"));
});

function testBitsFromHexStr(hex: string, expected: string) {
    return () => {
        const expectedBits = expected.split("").map(b => b === "1");
        const result = byte.bitsFromHexStr(hex).bits;
        assert.strictEqual(result.length, expectedBits.length);
        for (let i = 0; i < expectedBits.length; ++i) {
            assert.strictEqual(result[i], expectedBits[i]);
        }
    }
}

function testNumToBits(num: number, bits: string): () => void {
    return () => {
        assert.strictEqual(byte.numToBits(num).result.map(b => b ? "1" : "0").join(""), bits);
    }
}

function testTwosComplement(num: string, bits: string): () => void {
    return () => {
        assert.strictEqual(byte.twosComplement(num.split("").map(b => b === "1")).map(b => b ? "1" : "0").join(""), bits);
    }
}

function testBitsNumFill(num: string, lenToFill: number, signed: boolean, expectedBits: string, raiseError?: boolean): () => void {
    return () => {
        const { bits, err } = byte.bitsNumFill(byte.bitsFrom01Str(num), lenToFill, signed);
        if (raiseError) {
            if (err) {
                assert.ok(true, "error received");
            } else {
                assert.ok(false, "expecting an error");
            }
        } else {
            assert.strictEqual(byte.bitsTo01Str(bits), expectedBits);
        }
    }
}

function testRange(expectedResult: number[], start: number, end?: number, raiseError?: boolean) {
    return () => {
        const { result, err } = (<any>range)(start, end);
        if (raiseError) {
            if (err) {
                assert.ok(true, "error received");
            } else {
                assert.ok(false, "expecting an error");
            }
        } else {
            assert.strictEqual(result.length, expectedResult.length, "same length");
            for (let i = 0; i < result.length; ++i) {
                assert.strictEqual(result[i], expectedResult[i]);
            }
        }
    };
}
