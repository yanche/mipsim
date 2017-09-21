
import { Byte, Word } from "../def";
import { flatten } from "./index";

function makeFalseArray(len: number): boolean[] {
    const ret = new Array(len);
    for (let i = 0; i < len; ++i) {
        ret[i] = false;
    }
    return ret;
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

export function bits5ToRegNum(bits: Array<boolean>, offset: number): number {
    const nbits = bits.slice(offset, offset + 5).map(b => b ? 1 : 0);
    return nbits[0] * 16 + nbits[1] * 8 + nbits[2] * 4 + nbits[3] * 2 + nbits[4];
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
