
import { Word, Bit } from "../def";
import { REG, IMM, ADDR, LABEL, PSEUDOADDR, InstructionComponentPattern as CPattern, parseComponent } from "./pattern";
import { byte, flatten } from "../utility";
import { Parser, Instruction } from "./def";
import { MIPSError, SyntaxErrorCode } from "../error";

export function parseComponents<T extends (REG | IMM | ADDR | LABEL | PSEUDOADDR)[]>(comp: string, pattern: CPattern[]): T {
    const components = comp.split(",").map(x => x.trim()).filter(x => x.length > 0);
    if (components.length !== pattern.length) {
        throw new MIPSError(`invalid component part: ${comp}, required: ${pattern.map(x => CPattern[x]).join(" ")}`, SyntaxErrorCode.UNEXPECTED_COMPONENT);
    } else {
        return <T>components.map((c, idx) => parseComponent(c, pattern[idx]));
    }
}

function processComponents<T extends (REG | IMM | ADDR | LABEL | PSEUDOADDR)[]>(components: string, pattern: CPattern[], processor: (comps: T) => Word): Word {
    return processor(parseComponents<T>(components, pattern));
}

export function genParserREG1(leadingBits: string, followingBits: string): Parser {
    return (components: string): Word => {
        return processComponents<[REG]>(components, [CPattern.REG], (comps: [REG]) => {
            const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum).result, 5, false).bits;
            return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits).concat(byte.bitsFrom01Str(followingBits));
        });
    };
}

export function genParserREG2(leadingBits: string, followingBits: string): Parser {
    return (components: string): Word => {
        return processComponents<[REG, REG]>(components, [CPattern.REG, CPattern.REG], (comps: [REG, REG]) => {
            const regbits = comps.map(com => byte.bitsNumFill(byte.numToBits(com.regNum).result, 5, false).bits);
            return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsFrom01Str(followingBits));
        });
    };
}

export function genParserREG3(leadingBits: string, followingBits: string, reposIdx?: [number, number, number]): Parser {
    return (components: string): Word => {
        return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
            reposIdx = reposIdx || [1, 2, 0];
            const regbits = reposIdx.map(i => comps[i]).map(com => byte.bitsNumFill(byte.numToBits(com.regNum).result, 5, false).bits);
            return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsFrom01Str(followingBits));
        });
    };
}

// 2 registers and one 16 bits integer
export function genParserREG2IMM16b(leadingBits: string): Parser {
    return (components: string): Word => {
        return processComponents<[REG, REG, IMM]>(components, [CPattern.REG, CPattern.REG, CPattern.IMM], (comps: [REG, REG, IMM]) => {
            const regbits = (<[REG, REG]>comps.slice(0, 2)).map(com => byte.bitsNumFill(byte.numToBits(com.regNum).result, 5, false).bits);
            const imm = comps[2].num;
            // register appear in first place (destination register) will be encoded last
            return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits[1]).concat(regbits[0]).concat(encodeIMM(imm, 16));
        });
    };
}

// 1 registers and one 16 bits integer
export function genParserREG1IMM16b(leadingBits: string): Parser {
    return (components: string): Word => {
        return processComponents<[REG, IMM]>(components, [CPattern.REG, CPattern.IMM], (comps: [REG, IMM]) => {
            const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum).result, 5, false).bits;
            const imm = comps[1].num;
            return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits).concat(encodeIMM(imm, 16));
        });
    };
}

// 2 registers and one 5 bits signed integer
export function genParserREG2IMM5b(leadingBits: string, followingBits: string): Parser {
    return (components: string): Word => {
        return processComponents<[REG, REG, IMM]>(components, [CPattern.REG, CPattern.REG, CPattern.IMM], (comps: [REG, REG, IMM]) => {
            const regbits = (<[REG, REG]>comps.slice(0, 2)).map(com => byte.bitsNumFill(byte.numToBits(com.regNum).result, 5, false).bits);
            const imm = comps[2].num;
            // register appear in first place (destination register) will be encoded last
            return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits[1]).concat(regbits[0]).concat(encodeIMM(imm, 5)).concat(byte.bitsFrom01Str(followingBits));
        });
    };
}

export function genParserREG1Addr16b(leadingBits: string): Parser {
    return (components: string): Word => {
        return processComponents<[REG, ADDR]>(components, [CPattern.REG, CPattern.ADDR], (comps: [REG, ADDR]) => {
            const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum).result, 5, false).bits;
            const addrBaseRegBits = byte.bitsNumFill(byte.numToBits(comps[1].regNum).result, 5, false).bits;
            const imm = comps[1].offset;
            return <Word>byte.bitsFrom01Str(leadingBits).concat(addrBaseRegBits).concat(regbits).concat(encodeIMM(imm, 16));
        });
    };
}

export function genParserREG1LabelOffsetIMM16b(leadingBits: string, followingBits: string): Parser {
    return (components: string, addr: number, labelMap: Map<string, number>, generated?: boolean): Word => {
        return processComponents<[REG, LABEL | IMM]>(components, [CPattern.REG, CPattern.LABEL | CPattern.IMM], (comps: [REG, LABEL | IMM]) => {
            const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum).result, 5, false).bits;
            const label = comps[1];
            const imm = getOffsetToLabel(addr, label, labelMap, generated);
            return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits).concat(byte.bitsFrom01Str(followingBits)).concat(encodeIMM(imm, 16));
        });
    };
}

function getOffsetToLabel(curAddr: number, label: LABEL | IMM, labelMap: Map<string, number>, generated: boolean): number {
    if (typeof label === "string") {
        if (!labelMap.has(label)) {
            throw new MIPSError(`label not found: ${label}`, SyntaxErrorCode.LABEL_NOT_FOUND);
        }
        const labelAddr = labelMap.get(label);
        return (labelAddr - curAddr) / 4;
    } else {
        if (generated) {
            if (label.num % 4) {
                throw new MIPSError(`offset of branch instruction must be a multiple of 4: ${label.num}`, SyntaxErrorCode.INVALID_COMPONENT);
            }
            return label.num / 4;
        } else {
            throw new MIPSError(`branch instruction only accept a label as target address, input is an immediate number: ${label.num}`, SyntaxErrorCode.BRANCH_ONLY_LABEL);
        }
    }
}

export function genParserREG2LabelOffsetIMM16b(leadingBits: string): Parser {
    return (components: string, addr: number, labelMap: Map<string, number>, generated?: boolean): Word => {
        return processComponents<[REG, REG, LABEL | IMM]>(components, [CPattern.REG, CPattern.REG, CPattern.LABEL | CPattern.IMM], (comps: [REG, REG, LABEL | IMM]) => {
            const regbits = (<[REG, REG]>comps.slice(0, 2)).map(com => byte.bitsNumFill(byte.numToBits(com.regNum).result, 5, false).bits);
            const label = comps[2];
            const imm = getOffsetToLabel(addr, label, labelMap, generated);
            return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(encodeIMM(imm, 16));
        });
    };
}

export function genParserLabelIMM26b(leadingBits: string): Parser {
    return (components: string, addr: number, labelMap: Map<string, number>, generated?: boolean): Word => {
        return processComponents<[LABEL | IMM]>(components, [CPattern.LABEL | CPattern.IMM], (comps: [LABEL | IMM]) => {
            const label = comps[0];
            const imm = getOffsetToLabel(addr, label, labelMap, generated);
            return <Word>byte.bitsFrom01Str(leadingBits).concat(encodeIMM(imm, 26));
        });
    };
}

export function makeInstructionNameMap(ins: Instruction[]): Map<string, Instruction> {
    const nameMap = new Map<string, Instruction>();
    for (let i of ins) {
        nameMap.set(i.name, i);
    }
    return nameMap;
}

function encodeIMM(imm: number, finLen: number): Bit[] {
    let immBits = byte.numToBits(imm).result;
    if (immBits.length === (finLen + 1) && !immBits[0]) {
        immBits = immBits.slice(1);
    }
    if (immBits.length > finLen) {
        throw new MIPSError(`unable to encode integer: ${imm} into ${finLen} bits number`, SyntaxErrorCode.NUM_OVERFLOW);
    }
    const { err, bits } = byte.bitsNumFill(immBits, finLen, true);
    if (err) {
        throw new MIPSError(`failed to encode integer into ${finLen}-bits integer: ${imm}`, SyntaxErrorCode.NUM_OVERFLOW);
    }
    return bits;
}
