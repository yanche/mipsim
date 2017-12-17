
import { parseMIPSCode } from "../index";
import { byte, flatten } from "../../utility";
import { Word, Bit, Byte } from "../../def";
import { parse } from "../../instruction";
import * as assert from "assert";

export interface ExpectedMemory {
    addr: string;
    instruction: string;
    generated?: boolean;
}

export function testMIPSParsing2(code: string, consecutiveInstructions: string[], startMem: string, labelMap: Map<string, number>, generated?: boolean): void {
    return testMIPSParsing(code, instructionIntoConsecutiveMemory(startMem, consecutiveInstructions, generated), labelMap);
}

export function testMIPSParsing(code: string, memData: ExpectedMemory[], labelMap: Map<string, number>): void {
    const memExpected: { addr: string, data: string }[] = memData.map(m => {
        return {
            addr: m.addr,
            data: byte.wordToHexString(parse(m.instruction, parseInt(m.addr, 16), labelMap, m.generated))
        }
    });
    const codelines = code.replace("\r", "").split("\n").map(s => s.trim()).filter(s => s.length);
    const mem = parseMIPSCode(codelines).mem;
    for (let m of memExpected) {
        const addrNum = parseInt(m.addr, 16);
        if (m.data.length === 0 || m.addr.length === 0 || isNaN(addrNum)) {
            throw new Error(`invalid mem addr or data: ${m.addr}, ${m.data}`);
        }
        // addr must be hexical, leading 0x is optional
        let addrWord = <Word>byte.bitsNumFill(byte.numToBits(addrNum).result, 32, false).bits;
        const data = m.data;
        let membits: Bit[];
        // data is hexical
        const ds = data.toLowerCase().split("");
        if (ds.length % 2 !== 0 || !ds.every(s => {
            const ch = s.charCodeAt(0);
            return (ch_0 <= ch && ch <= ch_9) || (ch_a <= ch && ch <= ch_f);
        })) {
            throw new Error(`data in hexical must consists of 0-9a-fA-F and length%2 must be 0: ${data}`);
        }
        membits = flatten(ds.map(s => byte.bitsNumFill(byte.numToBits(parseInt(s, 16)).result, 4, false).bits));
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
    assert.strictEqual(act, ext, `data different at address: 0x${byte.wordToHexString(addr)}, actual: ${byte.byteToHexString(actual)}, expected: ${byte.byteToHexString(expected)}`);
}

function instructionIntoConsecutiveMemory(startAddr: string, instructions: string[], generated?: boolean): ExpectedMemory[] {
    // address in hexical string
    const baseAddr = parseInt(startAddr, 16);
    return instructions.map((c, idx) => {
        const addr = <Word>byte.bitsNumFill(byte.numToBits(baseAddr + 4 * idx).result, 32, false).bits;
        return {
            addr: byte.wordToHexString(addr),
            instruction: c,
            generated: generated
        };
    });
}

const ch_0 = "0".charCodeAt(0);
const ch_9 = "9".charCodeAt(0);
const ch_a = "a".charCodeAt(0);
const ch_f = "f".charCodeAt(0);
