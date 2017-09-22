
import { Byte, Word } from "../def";
import { flatten } from "./index";
import * as validate from "./validate";

export function makeArray<T>(len: number, valForAll: T): Array<T> {
    const ret = new Array<T>(len);
    for (let i = 0; i < len; ++i) {
        ret[i] = valForAll;
    }
    return ret;
}

export function makeFalseArray(len: number): boolean[] {
    return makeArray(len, false);
}

export function makeTrueArray(len: number): boolean[] {
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

export function bitsToNum(bits: Array<boolean>, signed: boolean): number {
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

export function numToBits(num: number): Array<boolean> {
    if (!validate.num(num, validate.NUM_FLAG.INT)) {
        throw new Error(`input for numToBits must be an integer: ${num}`);
    }
    let neg = num < 0;
    if (neg) {
        num = -num - 1;
    }
    let ret = new Array<boolean>();
    while (num > 0) {
        const remainder = num % 2;
        ret.unshift(remainder === 1);
        num = (num - remainder) / 2;
    }
    ret.unshift(neg ? true : false);
    return ret;
}

export function bits5ToRegNum(bits: Array<boolean>, offset: number): number {
    return bitsToNum(bits.slice(offset, offset + 5), false);
}

// signed
export function bitsAdd(bits1: Word, bits2: Word): {
    result: Word;
    overflow: boolean;
}
export function bitsAdd(bits1: Array<boolean>, bits2: Array<boolean>): {
    result: Array<boolean>;
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
export function bitsAnd(bits1: Array<boolean>, bits2: Array<boolean>): Array<boolean> {
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
export function bitsOr(bits1: Array<boolean>, bits2: Array<boolean>): Array<boolean> {
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

export function bitsEqual(bits1: Array<boolean>, bits2: Array<boolean>): boolean {
    if (bits1.length !== bits2.length) {
        throw new Error(`length different in bitsEqual, ${bits1.length}, ${bits2.length}`);
    }
    return bits1.every((b, idx) => {
        return b === bits2[idx];
    });
}

export function bitsDiv(bits1: Word, bits2: Word): {
    quotient: Word;
    remainder: Word;
}

// bits1 / bits2
export function bitsDiv(bits1: Word, bits2: Word, signed: boolean): {
    quotient: Word;
    remainder: Word;
} {
    if (bits1.length !== bits2.length) {
        throw new Error(`length different in bitsEqual, ${bits1.length}, ${bits2.length}`);
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
