
import { Word } from "../def";
import { REG, IMM, ADDR, LABEL, InstructionComponentPattern as CPattern, parseComponent } from "./pattern";
import { byte, flatten } from "../utility";
import { Parser, minSignedNum16Bits, maxSignedNum16Bits, maxUnsignedNum16Bits, maxUnsignedNum26Bits, maxUnsignedNum5Bits, Instruction } from "./def";

function parseComponents(comp: string, pattern: CPattern[]) {
    comp = comp.replace(",", " ");
    const components = comp.split(" ").filter(x => x.length > 0);
    if (components.length !== pattern.length) {
        throw new Error(`invalid component part: ${comp}, required: ${pattern.map(x => CPattern[x]).join(" ")}`);
    }
    return components.map((c, idx) => parseComponent(c, pattern[idx]));
}

export function genParserREG1(leadingBits: string, followingBits: string): Parser {
    return (components: string): Word => {
        const comps = <[REG]>parseComponents(components, [CPattern.REG]);
        const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum), 5, false);
        return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits).concat(byte.bitsFrom01Str(followingBits));
    };
}

export function genParserREG2(leadingBits: string, followingBits: string): Parser {
    return (components: string): Word => {
        const comps = <[REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG]);
        const regbits = comps.map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
        return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsFrom01Str(followingBits));
    };
}

export function genParserREG3(leadingBits: string, followingBits: string, reposIdx?: [number, number, number]): Parser {
    return (components: string): Word => {
        reposIdx = reposIdx || [1, 2, 0];
        const comps = <[REG, REG, REG]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.REG]);
        const regbits = reposIdx.map(i => comps[i]).map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
        return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsFrom01Str(followingBits));
    };
}

// one 26 bits signed integer (in J instruction)
export function genParserIMM26b(leadingBits: string): Parser {
    return (components: string): Word => {
        const comps = <[IMM]>parseComponents(components, [CPattern.IMM]);
        const imm = comps[0].num;
        if (imm > maxUnsignedNum26Bits || imm < 0) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits unsigned number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(byte.bitsNumFill(byte.numToBits(imm), 26, false));
    };
}

// 2 registers and one 16 bits signed integer
export function genParserREG2IMM16b(leadingBits: string, signed: boolean): Parser {
    return (components: string): Word => {
        const comps = <[REG, REG, IMM]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.IMM]);
        const regbits = (<[REG, REG]>comps.slice(0, 2)).map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
        const imm = comps[2].num;
        if (signed && (imm > maxSignedNum16Bits || imm < minSignedNum16Bits)) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits signed number`);
        }
        if (!signed && (imm > maxUnsignedNum16Bits || imm < 0)) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits unsigned number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsNumFill(byte.numToBits(imm), 16, signed));
    };
}

// 1 registers and one 16 bits signed integer
export function genParserREG1IMM16b(leadingBits: string, followingBits: string, signed: boolean): Parser {
    return (components: string): Word => {
        const comps = <[REG, IMM]>parseComponents(components, [CPattern.REG, CPattern.IMM]);
        const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum), 5, false);
        const imm = comps[1].num;
        if (signed && (imm > maxSignedNum16Bits || imm < minSignedNum16Bits)) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits signed number`);
        }
        if (!signed && (imm > maxUnsignedNum16Bits || imm < 0)) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits unsigned number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits).concat(byte.bitsFrom01Str(followingBits)).concat(byte.bitsNumFill(byte.numToBits(imm), 16, signed));
    };
}

// 2 registers and one 5 bits signed integer
export function genParserREG2IMM5b(leadingBits: string, followingBits: string): Parser {
    return (components: string): Word => {
        const comps = <[REG, REG, IMM]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.IMM]);
        const regbits = (<[REG, REG]>comps.slice(0, 2)).map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
        const imm = comps[2].num;
        if (imm > maxUnsignedNum5Bits || imm < 0) {
            throw new Error(`unable to encode integer: ${imm} into 5 bits unsigned number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsNumFill(byte.numToBits(imm), 5, false)).concat(byte.bitsFrom01Str(followingBits));
    };
}

export function genParserREG1Addr16b(leadingBits: string): Parser {
    return (components: string): Word => {
        const comps = <[REG, ADDR]>parseComponents(components, [CPattern.REG, CPattern.ADDR]);
        const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum), 5, false);
        const addrBaseRegBits = byte.bitsNumFill(byte.numToBits(comps[1].regNum), 5, false);
        const imm = comps[1].offset;
        if (imm > maxSignedNum16Bits || imm < minSignedNum16Bits) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits signed number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(addrBaseRegBits).concat(regbits).concat(byte.bitsNumFill(byte.numToBits(imm), 16, true));
    };
}

export function genParserREG1LabelOffsetIMM16b(leadingBits: string, followingBits: string): Parser {
    return (components: string, addr: number, labelMap: Map<string, number>): Word => {
        const comps = <[REG, IMM | LABEL]>parseComponents(components, [CPattern.REG, CPattern.IMM | CPattern.LABEL]);
        const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum), 5, false);
        let imm: number;
        const lastComp = comps[1];
        if (typeof lastComp === "string") {
            if (!labelMap.has(lastComp)) {
                throw new Error(`label not found: ${lastComp}`);
            }
            const labelAddr = labelMap.get(lastComp);
            imm = (labelAddr - addr) / 4;
        } else {
            imm = lastComp.num;
        }
        if (imm > maxSignedNum16Bits || imm < minSignedNum16Bits) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits signed number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits).concat(byte.bitsFrom01Str(followingBits)).concat(byte.bitsNumFill(byte.numToBits(imm), 16, true));
    };
}

export function genParserREG2LabelOffsetIMM16b(leadingBits: string): Parser {
    return (components: string, addr: number, labelMap: Map<string, number>): Word => {
        const comps = <[REG, REG, IMM | LABEL]>parseComponents(components, [CPattern.REG, CPattern.REG, CPattern.IMM | CPattern.LABEL]);
        const regbits = (<[REG, REG]>comps.slice(0, 2)).map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
        let imm: number;
        const lastComp = comps[2];
        if (typeof lastComp === "string") {
            if (!labelMap.has(lastComp)) {
                throw new Error(`label not found: ${lastComp}`);
            }
            const labelAddr = labelMap.get(lastComp);
            imm = (labelAddr - addr) / 4;
        } else {
            imm = lastComp.num;
        }
        if (imm > maxSignedNum16Bits || imm < minSignedNum16Bits) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits signed number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsNumFill(byte.numToBits(imm), 16, true));
    };
}

export function genParserLabelIMM26b(leadingBits: string): Parser {
    return (components: string, addr: number, labelMap: Map<string, number>): Word => {
        const comps = <[IMM | LABEL]>parseComponents(components, [CPattern.IMM | CPattern.LABEL]);
        let imm: number;
        const lastComp = comps[0];
        if (typeof lastComp === "string") {
            if (!labelMap.has(lastComp)) {
                throw new Error(`label not found: ${lastComp}`);
            }
            imm = labelMap.get(lastComp) / 4;
        } else {
            imm = lastComp.num;
        }
        if (imm > maxUnsignedNum26Bits || imm < 0) {
            throw new Error(`unable to encode integer: ${imm} into 16 bits unsigned number`);
        }
        return <Word>byte.bitsFrom01Str(leadingBits).concat(byte.bitsNumFill(byte.numToBits(imm), 26, false));
    };
}

export function makeInstructionNameMap(ins: Instruction[]): Map<string, Instruction> {
    const nameMap = new Map<string, Instruction>();
    for (let i of ins) {
        nameMap.set(i.name, i);
    }
    return nameMap;
}
