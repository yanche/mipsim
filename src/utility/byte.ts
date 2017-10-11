
import { Byte, Word, Bit } from "../def";
import { flatten } from "./index";
import * as validate from "./validate";

export function makeArray<T>(len: number, valForAll: T): T[] {
    const ret = new Array<T>(len);
    for (let i = 0; i < len; ++i) {
        ret[i] = valForAll;
    }
    return ret;
}

export function makeFalseArray(len: number): Bit[] {
    return makeArray(len, false);
}

export function makeTrueArray(len: number): Bit[] {
    return makeArray(len, true);
}

export function makeByte0(): Byte {
    return <Byte>makeFalseArray(8);
}

export function makeWord0(): Word {
    return <Word>makeFalseArray(32);
}

export function makeHalfWord0(): Word {
    return <Word>makeFalseArray(16);
}

export function bitsToNum(bits: Bit[], signed: boolean): number {
    let ret = 0;
    for (let i = 0; i < bits.length; ++i) {
        ret = ret * 2 + (bits[i] ? 1 : 0);
    }
    if (bits[0] && signed) {
        return ret - Math.pow(2, bits.length);
    } else {
        return ret;
    }
}

export function numToBits(num: number): Bit[] {
    if (!validate.num(num, validate.NUM_FLAG.INT)) {
        throw new Error(`input for numToBits must be an integer: ${num}`);
    }
    let neg = num < 0;
    if (neg) {
        num = -num - 1;
    }
    let ret = new Array<Bit>();
    while (num > 0) {
        const remainder = num % 2;
        ret.unshift(remainder === 1);
        num = (num - remainder) / 2;
    }
    ret.unshift(neg ? true : false);
    return ret;
}

export function bits5ToRegNum(bits: Bit[], offset: number): number {
    return bitsToNum(bits.slice(offset, offset + 5), false);
}

// signed
export function bitsAdd(bits1: Word, bits2: Word): {
    result: Word;
    overflow: boolean;
}
export function bitsAdd(bits1: Bit[], bits2: Bit[]): {
    result: Bit[];
    overflow: boolean;
} {
    if (bits1.length !== bits2.length) {
        throw new Error(`length different in bitsAdd, ${bits1.length}, ${bits2.length}`);
    }
    const len = bits1.length;
    const result = new Array(len);
    let carry = false;
    for (let i = len - 1; i >= 0; --i) {
        const b1 = bits1[i], b2 = bits2[i];
        result[i] = (b1 !== b2) !== carry;
        carry = (b1 && b2) || ((b1 !== b2) && carry);
    }
    return {
        result: result,
        overflow: carry
    };
}

export function bitsAnd(bits1: Word, bits2: Word): Word;
export function bitsAnd(bits1: Bit[], bits2: Bit[]): Bit[] {
    if (bits1.length !== bits2.length) {
        throw new Error(`length different in bitsAnd, ${bits1.length}, ${bits2.length}`);
    }
    const len = bits1.length;
    const result = new Array(len);
    for (let i = 0; i < len; ++i) {
        result[i] = bits1[i] && bits2[i];
    }
    return result;
}

export function bitsOr(bits1: Word, bits2: Word): Word;
export function bitsOr(bits1: Bit[], bits2: Bit[]): Bit[] {
    if (bits1.length !== bits2.length) {
        throw new Error(`length different in bitsOr, ${bits1.length}, ${bits2.length}`);
    }
    const len = bits1.length;
    const result = new Array(len);
    for (let i = 0; i < len; ++i) {
        result[i] = bits1[i] || bits2[i];
    }
    return result;
}

export function bitsXor(bits1: Word, bits2: Word): Word;
export function bitsXor(bits1: Bit[], bits2: Bit[]): Bit[] {
    if (bits1.length !== bits2.length) {
        throw new Error(`length different in bitsXor, ${bits1.length}, ${bits2.length}`);
    }
    const len = bits1.length;
    const result = new Array(len);
    for (let i = 0; i < len; ++i) {
        result[i] = bits1[i] !== bits2[i]; // bits1[i] ^ bits2[i]
    }
    return result;
}

export function bitsEqual(bits1: Bit[], bits2: Bit[]): boolean {
    if (bits1.length !== bits2.length) {
        throw new Error(`length different in bitsEqual, ${bits1.length}, ${bits2.length}`);
    }
    return bits1.every((b, idx) => {
        return b === bits2[idx];
    });
}

// export function bitsDiv(bits1: Word, bits2: Word): {
//     quotient: Word;
//     remainder: Word;
// }
// bits1 / bits2
export function bitsDiv(bits1: Word, bits2: Word, signed: boolean): {
    quotient: Word;
    remainder: Word;
} {
    if (bits1.length !== bits2.length) {
        throw new Error(`length different in bitsDiv, ${bits1.length}, ${bits2.length}`);
    }
    const num1 = bitsToNum(bits1, signed), num2 = bitsToNum(bits2, signed);
    const r = num1 % num2;
    const q = (num1 - r) / num2;
    let qbits = numToBits(q), rbits = numToBits(r);
    if (qbits.length < 32) {
        qbits = makeArray(32 - qbits.length, qbits[0]).concat(qbits);
    }
    qbits = qbits.slice(32);
    if (rbits.length < 32) {
        rbits = makeArray(32 - rbits.length, rbits[0]).concat(rbits);
    }
    rbits = rbits.slice(32);
    return {
        quotient: <Word>qbits,
        remainder: <Word>rbits
    };
}

// bits1 / bits2
export function bitsMul(bits1: Word, bits2: Word, signed: boolean): {
    high: Word;
    low: Word;
} {
    if (bits1.length !== bits2.length) {
        throw new Error(`length different in bitsMul, ${bits1.length}, ${bits2.length}`);
    }
    const num1 = bitsToNum(bits1, signed), num2 = bitsToNum(bits2, signed);
    const mul = num1 * num2;
    let bits = numToBits(mul);
    if (bits.length < 64) {
        bits = makeArray(64 - bits.length, bits[0]).concat(bits);
    }
    return {
        high: <Word>bits.slice(32),
        low: <Word>bits.slice(32)
    };
}

export function bitsNumFill(bitsOfNum: Bit[], lenToFill: number, signed: boolean): Bit[] {
    if (bitsOfNum.length > lenToFill) {
        if (signed) {
            throw new Error(`length of input bits is larger than the target: ${bitsOfNum.length}, ${lenToFill}`);
        } else {
            const first1 = bitsOfNum.indexOf(true);
            const startIdx = bitsOfNum.length - lenToFill;
            if (first1 < startIdx) {
                throw new Error(`length of input bits is larger than the target: ${bitsOfNum.length}, ${lenToFill}`);
            } else {
                // for unsigned integer
                return bitsOfNum.slice(startIdx);
            }
        }
    }
    return makeArray(lenToFill - bitsOfNum.length, signed ? bitsOfNum[0] : false).concat(bitsOfNum);
}

export function bitsFrom01Str(strOf01: string): Bit[] {
    return strOf01.split("").map(s => {
        if (s === "1") {
            return true;
        } else if (s === "0") {
            return false;
        } else {
            throw new Error(`invalid string input, only 0 or 1 are allowed: ${strOf01}`);
        }
    })
}

type Bits4 = [Bit, Bit, Bit, Bit];

export function bits4ToHexString(input: Bits4): string {
    return bitsToNum(input.slice(0, 4), false).toString(16);
}

export function byteToHexString(input: Byte): string {
    return bits4ToHexString(<Bits4>input.slice(0, 4)) + bits4ToHexString(<Bits4>input.slice(4));
}

export function wordToHexString(input: Word): string {
    return [0, 8, 16, 24].map(i => byteToHexString(<Byte>input.slice(i, i + 8))).join("");
}

const hexMap = new Map<string, string>();
for (let i = 0; i < 16; ++i) {
    const binary = bitsNumFill(numToBits(i), 4, false).map(d => d ? "1" : "0").join("");
    hexMap.set(binary, i.toString(16));
}
export function wordToHex(word: Word): string {
    const ret: string[] = [];
    for (let i = 0; i < 8; ++i) {
        ret.push(hexMap.get(word.slice(i * 4, i * 4 + 4).map(d => d ? "1" : "0").join("")));
    }
    return ret.join("");
}
