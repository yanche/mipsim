
import { Word } from "../def";
import { REG, IMM, ADDR } from "./pattern";
import { byte, flatten } from "../utility";
import { minSignedNum16Bits, maxSignedNum16Bits, maxUnsignedNum16Bits, maxUnsignedNum26Bits, maxUnsignedNum5Bits } from "./def";

export function genParserREG1(leadingBits: string, followingBits: string): (components: [REG]) => Word {
    return (components: [REG]): Word => {
        const regbits = byte.bitsNumFill(byte.numToBits(components[0].regNum), 5, false);
        return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits).concat(byte.bitsFrom01Str(followingBits));
    };
}

export function genParserREG2(leadingBits: string, followingBits: string): (components: [REG, REG]) => Word {
    return (components: [REG, REG]): Word => {
        const regbits = components.map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
        return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsFrom01Str(followingBits));
    };
}

export function genParserREG3(leadingBits: string, followingBits: string, reposIdx?: [number, number, number]): (components: [REG, REG, REG]) => Word {
    return (components: [REG, REG, REG]): Word => {
        reposIdx = reposIdx || [1, 2, 0];
        const regbits = reposIdx.map(i => components[i]).map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
        return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsFrom01Str(followingBits));
    };
}

// one 26 bits signed integer (in J instruction)
export function genParserIMM26b(leadingBits: string): (components: [IMM]) => Word {
    return (components: [IMM]): Word => {
        const imm = components[0].num;
        if (imm > maxUnsignedNum26Bits || imm < 0) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits unsigned number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(byte.bitsNumFill(byte.numToBits(imm), 26, false));
    }
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

// 1 registers and one 16 bits signed integer
export function genParserREG1IMM16b(leadingBits: string, followingBits: string, signed: boolean): (components: [REG, IMM]) => Word {
    return (components: [REG, IMM]): Word => {
        const regbits = byte.bitsNumFill(byte.numToBits(components[0].regNum), 5, false);
        const imm = components[1].num;
        if (signed && (imm > maxSignedNum16Bits || imm < minSignedNum16Bits)) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits signed number`);
        }
        if (!signed && (imm > maxUnsignedNum16Bits || imm < 0)) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits unsigned number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits).concat(byte.bitsFrom01Str(followingBits)).concat(byte.bitsNumFill(byte.numToBits(imm), 16, signed));
    }
}

// 2 registers and one 5 bits signed integer
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

export function genParserREG1Addr16b(leadingBits: string): (components: [REG, ADDR]) => Word {
    return (components: [REG, ADDR]): Word => {
        const regbits = byte.bitsNumFill(byte.numToBits(components[0].regNum), 5, false);
        const addrBaseRegBits = byte.bitsNumFill(byte.numToBits(components[1].regNum), 5, false);
        const imm = components[1].offset;
        if (imm > maxSignedNum16Bits || imm < minSignedNum16Bits) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits signed number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(addrBaseRegBits).concat(regbits).concat(byte.bitsNumFill(byte.numToBits(imm), 16, true));
    }
}
