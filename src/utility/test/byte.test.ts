
import * as assert from "assert";
import * as byte from "../byte";

describe("numToBits", () => {
    it("16", testNumToBits(16, "010000"));
    it("-16", testNumToBits(-16, "110000"));
    it("10", testNumToBits(10, "01010"));
    it("-10", testNumToBits(-10, "10110"));
    it("0", testNumToBits(0, "0"));
    it("1", testNumToBits(1, "01"));
    it("-1", testNumToBits(-1, "11"));
    it("65535", testNumToBits(65535, "01111111111111111"))
});

function testNumToBits(num: number, bits: string): () => void {
    return () => {
        assert.strictEqual(byte.numToBits(num).result.map(b => b ? "1" : "0").join(""), bits);
    }
}
