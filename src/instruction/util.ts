
import { Word } from "../def";
import { REG, IMM } from "./pattern";
import { byte, flatten } from "../utility";
import { minSignedNum16Bits, maxSignedNum16Bits, maxUnsignedNum16Bits, maxUnsignedNum5Bits } from "./def";

export function genParserREG2(leadingBits: string, followingBits: string): (components: [REG, REG]) => Word {
    return (components: [REG, REG]): Word => {
        const regbits = components.map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
        return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsFrom01Str(followingBits));
    };
}

export function genParserREG3(leadingBits: string, followingBits: string): (components: [REG, REG, REG]) => Word {
    return (components: [REG, REG, REG]): Word => {
        const regbits = components.map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
        return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsFrom01Str(followingBits));
    };
}

// 2 registers and one 16 bits signed integer
export function genParserREG2IMM16b(leadingBits: string, signed: boolean): (components: [REG, REG, IMM]) => Word {
    return (components: [REG, REG, IMM]): Word => {
        const regbits = (<[REG, REG]>components.slice(0, 2)).map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
        const imm = components[2].num;
        if (signed && (imm > maxSignedNum16Bits || imm < minSignedNum16Bits)) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits signed number`);
        }
        if (!signed && (imm > maxUnsignedNum16Bits || imm < 0)) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits unsigned number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsNumFill(byte.numToBits(imm), 16, signed));
    }
}

export function genParserREG2IMM5b(leadingBits: string, followingBits: string): (components: [REG, REG, IMM]) => Word {
    return (components: [REG, REG, IMM]): Word => {
        const regbits = (<[REG, REG]>components.slice(0, 2)).map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
        const imm = components[2].num;
        if (imm > maxUnsignedNum5Bits || imm < 0) {
            throw new Error(`unable to encode integer: ${imm} into 5 bits unsigned number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsNumFill(byte.numToBits(imm), 5, false)).concat(byte.bitsFrom01Str(followingBits));
    }
}
