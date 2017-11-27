
import { ascii, asciiz, _byte, half, word, align, space, DataDirectiveParser } from "../dataalloc";
import { Byte } from "../../def";
import { byte } from "../../utility";
import * as assert from "assert";
import { MIPSError, SyntaxErrorCode } from "../../error/index";

describe("ascii", () => {
    it("abc", testDataAllocation(ascii, `"abc"`, stringToHex("abc")));
    it("012", testDataAllocation(ascii, `"012"`, stringToHex("012")));
    it("\\n\\r\\t\\\\", testDataAllocation(ascii, `"\\n\\r\t\\\\"`, stringToHex("\n\r\t\\")));
    it("empty content", testDataAllocation(ascii, "", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
    it(`""`, testDataAllocation(ascii, `""`, "", 0, SyntaxErrorCode.INVALID_COMPONENT));
});

describe("asciiz", () => {
    it("abc", testDataAllocation(asciiz, `"abc"`, stringToHex("abc\0")));
    it("012", testDataAllocation(asciiz, `"012"`, stringToHex("012\0")));
    it("\\n\\r\\t\\\\", testDataAllocation(asciiz, `"\\n\\r\t\\\\"`, stringToHex("\n\r\t\\\0")));
    it("empty content", testDataAllocation(asciiz, "", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
    it(`""`, testDataAllocation(asciiz, `""`, "", 0, SyntaxErrorCode.INVALID_COMPONENT));
});

describe("byte", () => {
    it("0xff", testDataAllocation(_byte, "0xff", "ff"));
    it("0x00", testDataAllocation(_byte, "0x00", "00"));
    it("0x15", testDataAllocation(_byte, "0x15", "15"));
    it("0x0", testDataAllocation(_byte, "0x0", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
    it("0xf00", testDataAllocation(_byte, "0xf00", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
    it("0xq0", testDataAllocation(_byte, "0xq0", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
    it("empty content", testDataAllocation(_byte, "", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
});

describe("half", () => {
    it("0xffff", testDataAllocation(half, "0xffff", "ffff"));
    it("0x0000", testDataAllocation(half, "0x0000", "0000"));
    it("0x1523", testDataAllocation(half, "0x1523", "1523"));
    it("0x000", testDataAllocation(half, "0x000", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
    it("0xfff00", testDataAllocation(half, "0xfff00", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
    it("0xq000", testDataAllocation(half, "0xq000", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
    it("empty content", testDataAllocation(half, "", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
});

describe("word", () => {
    it("0xffff", testDataAllocation(word, "0xffff1111", "ffff1111"));
    it("0x0000", testDataAllocation(word, "0x00001234", "00001234"));
    it("0x1523", testDataAllocation(word, "0x1523afed", "1523afed"));
    it("0x0001111", testDataAllocation(word, "0x0001111", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
    it("0xfff001111", testDataAllocation(word, "0xfff001111", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
    it("0xq0001111", testDataAllocation(word, "0xq0001111", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
    it("empty content", testDataAllocation(word, "", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
});

describe("align", () => {
    it("align 1, 4", testDataAllocation(align, "1", "", 4));
    it("align 2, 4", testDataAllocation(align, "2", "", 4));
    it("align 1, 1", testDataAllocation(align, "1", "00", 1));
    it("align 2, 1", testDataAllocation(align, "2", "000000", 1));
    it("align 1, 2", testDataAllocation(align, "1", "", 2));
    it("align 2, 2", testDataAllocation(align, "2", "0000", 2));
    it("align 0", testDataAllocation(align, "0", "", 0, SyntaxErrorCode.INVALID_COMPONENT));
});

describe("space", () => {
    it("space 1", testDataAllocation(space, "1", "00"));
    it("space 5", testDataAllocation(space, "5", "0000000000"));
    it("space 0x2", testDataAllocation(space, "0x2", "0000"));
    it("space -5", testDataAllocation(space, "-5", "", 0, SyntaxErrorCode.INVALID_NUM));
    it("space 0xq", testDataAllocation(space, "0xq", "", 0, SyntaxErrorCode.INVALID_NUM));
    it("space q", testDataAllocation(space, "q", "", 0, SyntaxErrorCode.INVALID_NUM));
});

function testDataAllocation(parser: DataDirectiveParser, comp: string, expectedResult: string, addr?: number, errcode?: number) {
    return () => {
        try {
            const result = parser(comp, addr);
            assert.strictEqual(result.map(byte.byteToHexString).join(""), expectedResult);
        }
        catch (err) {
            if (errcode) {
                if (err instanceof MIPSError) {
                    assert.strictEqual(err.errcode, errcode);
                } else {
                    assert.ok(false, err);
                }
            } else {
                assert.ok(false, err);
            }
        }
    };
}

function stringToHex(str: string): string {
    return str.split("").map(s => {
        return byte.byteToHexString(<Byte>byte.bitsNumFill(byte.numToBits(s.charCodeAt(0)).result, 8, false).bits);
    }).join("");
}
