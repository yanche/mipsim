
export type Bit = boolean;
// array of lenght 8
export type Byte = [Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit];
export type Word = [
    Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
    Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
    Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
    Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit
];
export type HalfWord = [
    Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
    Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit
];
export type Addr = Word;
export const codeStartAddr: Addr = null;
