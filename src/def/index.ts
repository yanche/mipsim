
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
export const codeStartAddr = "0x00400000";
export const memBlockSize = 256; // bytes
export const heapPointerAddr = "0x10000000";
// actually 0x100000000, first word is preserved for heap pointer
export const dataStartAddr = "0x10000004";
export const heapPointerVal = "0x10040000";
export const stackPointerAddr = "0x7ffffffc";
