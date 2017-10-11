
import { parse } from "../../instruction";
import { parseMIPSCode } from "../index";
import { byte, flatten } from "../../utility";
import { Word, Bit, Byte } from "../../def";
import * as assert from "assert";

describe("simple code parsing test", () => {
    it("simple instructions", () => {
        const code = `
        main:
        ori $t1 $t1 10
        ori $t2 $t2 15
        add $t3 $t1 $t2
        `;
        testMIPSParsing(code, [
            {
                addr: "0x00400004",
                data: "0x" + byte.wordToHex(parse("ori $t1 $t1 10", 0, null))
            },
            {
                addr: "0x00400008",
                data: "0x" + byte.wordToHex(parse("ori $t2 $t2 15", 0, null))
            },
            {
                addr: "0x0040000c",
                data: "0x" + byte.wordToHex(parse("add $t3 $t1 $t2", 0, null))
            }
        ]);
    });
});



const ch_0 = "0".charCodeAt(0);
const ch_9 = "9".charCodeAt(0);
const ch_a = "a".charCodeAt(0);
const ch_f = "f".charCodeAt(0);
function testMIPSParsing(code: string, memExpected: { addr: string, data: string }[]): void {
    const codelines = code.replace("\r", "").split("\n").map(s => s.trim()).filter(s => s.length);
    const mem = parseMIPSCode(codelines);
    for (let m of memExpected) {
        const addrNum = parseInt(m.addr, 16);
        if (m.data.length === 0 || m.addr.length === 0 || isNaN(addrNum)) {
            throw new Error(`invalid mem addr or data: ${m.addr}, ${m.data}`);
        }
        // addr must be hex, leading 0x is optional
        let addrWord = <Word>byte.bitsNumFill(byte.numToBits(addrNum), 32, false);
        const data = m.data;
        let membits: Bit[];
        if (data.slice(0, 2) === "0x") {
            // hexical
            const ds = data.slice(2).toLowerCase().split("");
            if (ds.length % 2 !== 0 || !ds.every(s => {
                const ch = s.charCodeAt(0);
                return (ch_0 <= ch && ch <= ch_9) || (ch_a <= ch && ch <= ch_f);
            })) {
                throw new Error(`data in hexical must consists of 0-9a-fA-F and length%2 must be 0: ${data}`);
            }
            membits = flatten(ds.map(s => byte.bitsNumFill(byte.numToBits(parseInt(s, 16)), 4, false)));
        } else {
            // binary
            const ds = data.split("");
            if (ds.length % 8 !== 0 || ds.some(s => s !== "0" && s !== "1")) {
                throw new Error(`data in binary must consists of 0 or 1 and length%8 must be 0: ${data}`);
            }
            membits = ds.map(s => s === "1");
        }
        let idx = 0;
        while (idx < membits.length) {
            compareByte(mem.readByte(addrWord), <Byte>membits.slice(idx, idx + 8), addrWord);
            // addr += 1
            addrWord = <Word>byte.bitsAdd(addrWord, <Word>byte.makeFalseArray(31).concat([true])).result;
            idx += 8;
        }
    }
}

function compareByte(actual: Byte, expected: Byte, addr: Word): void {
    const act = actual.map(d => d ? "1" : "0").join("");
    const ext = expected.map(d => d ? "1" : "0").join("");
    assert.strictEqual(act, ext, `data different at address: 0x${byte.wordToHex(addr)}`);
}
