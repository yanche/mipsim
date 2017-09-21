
export enum NUM_FLAG {
    POS = 1,
    NEG = 2,
    NONPOS = 4,
    NONNEG = 8,
    INT = 16
}

export function num(input: any, flag?: NUM_FLAG): boolean {
    const isnum = typeof num === "number";
    const ispos = !(flag & NUM_FLAG.POS) || input > 0;
    const isneg = !(flag & NUM_FLAG.NEG) || input < 0;
    const isnonpos = !(flag & NUM_FLAG.NONPOS) || input <= 0;
    const isnonneg = !(flag & NUM_FLAG.NONNEG) || input >= 0;
    const isint = !(flag & NUM_FLAG.INT) || Math.ceil(input) === input;
    return isnum && ispos && isneg && isnonpos && isnonneg && isint;
}
