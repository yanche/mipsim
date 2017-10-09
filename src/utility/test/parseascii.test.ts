
import * as assert from "assert";
import { parseAsciiStr } from "../index";
import * as byte from "../byte";

describe("parse ascii test", () => {
    it("abc", () => {
        validate("abc", "abc");
    });

    it("\\n", () => {
        validate("\\n", "\n");
    });

    it("\\\\", () => {
        validate("\\\\", "\\");
    });

    it("\\nn", () => {
        validate("\\nn", "\nn");
    });

    it("\\Xff", () => {
        // \x is case sensitive, cannot use \X
        validate("\\Xff", "Xff");
    });

    it("\\xff", () => {
        // Hex
        validate("\\xff", "\xff");
    });

    it("\\x51", () => {
        // Hex
        validate("\\x51", "\x51");
    });

    it("\\x5F", () => {
        // Hex, case insensitive
        validate("\\x5F", "\x5f");
    });

    it("\\123", () => {
        // Octal
        validate("\\123", String.fromCharCode(64 + 16 + 3));
    });

    it("\\377", () => {
        // Octal, max
        validate("\\377", String.fromCharCode(255));
    });

    it("\\378", () => {
        // Octal, max overflow
        validate("\\378", String.fromCharCode(3 * 8 + 7) + "8");
    });

    it("\\0", () => {
        validate("\\0", String.fromCharCode(0));
    });

    it("a\\", () => {
        // tail \ should be ignored
        validate("a\\", "a");
    });

    it("\\q", () => {
        // non-matching \ should be ignored
        validate("\\q", "q");
    });
});

function validate(asciiStr: string, toStr: string): void {
    const asciiNums = parseAsciiStr(asciiStr).map(b => byte.bitsToNum(b, false));
    const expectedNums = toStr.split("").map(c => c.charCodeAt(0));
    assert.strictEqual(asciiNums.length, expectedNums.length, `result string length: ${asciiNums.length}, expected string length: ${expectedNums.length}`);
    for (let i = 0; i < asciiNums.length; ++i) {
        assert.strictEqual(asciiNums[i], expectedNums[i], `result char at index ${i}: ${String.fromCharCode(asciiNums[i])}, expected char: ${toStr[i]}`);
    }
}
