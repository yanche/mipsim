
export enum NUM_FLAG {
    POS = 1,
    NEG = 2,
    NONPOS = 4,
    NONNEG = 8,
    INT = 16
}

export function num(input: any, flag?: NUM_FLAG): boolean {
    const isnum = typeof input === "number";
    const ispos = !(flag & NUM_FLAG.POS) || input > 0;
    const isneg = !(flag & NUM_FLAG.NEG) || input < 0;
    const isnonpos = !(flag & NUM_FLAG.NONPOS) || input <= 0;
    const isnonneg = !(flag & NUM_FLAG.NONNEG) || input >= 0;
    const isint = !(flag & NUM_FLAG.INT) || Math.ceil(input) === input;
    return isnum && ispos && isneg && isnonpos && isnonneg && isint;
}

const ch_0 = "0".charCodeAt(0);
const ch_9 = "9".charCodeAt(0);
const ch_a = "a".charCodeAt(0);
const ch_z = "z".charCodeAt(0);
const ch_A = "A".charCodeAt(0);
const ch_Z = "Z".charCodeAt(0);
export function label(str: string): boolean {
    for (let i = 0; i < str.length; ++i) {
        const ch_s = str.charCodeAt(i);
        if (str[i] !== "_" && !((ch_0 <= ch_s && ch_s <= ch_9) || (ch_a <= ch_s && ch_s <= ch_z) || (ch_A <= ch_s || ch_s <= ch_Z))) {
            return false;
        }
    }
    const ch_s = str.charCodeAt(0);
    // first character is not digit
    return !(ch_0 <= ch_s && ch_s <= ch_9);
}
