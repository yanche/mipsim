
import { Word, Bit } from "../def";
import { REG, IMM, ADDR, LABEL, PSEUDOADDR, InstructionComponentPattern as CPattern, parseComponent } from "./pattern";
import { byte, flatten } from "../utility";
import { Parser, minSignedNum16Bits, maxSignedNum16Bits, maxUnsignedNum16Bits, maxUnsignedNum26Bits, maxUnsignedNum5Bits, Instruction, ParseResult } from "./def";

export interface ParseComponentsResult<T> {
    success: boolean;
    errmsg?: string;
    result?: T;
}

export function parseComponents<T extends (REG | IMM | ADDR | LABEL | PSEUDOADDR)[]>(comp: string, pattern: CPattern[]): ParseComponentsResult<T> {
    comp = comp.replace(/,/g, " ");
    const components = comp.split(" ").filter(x => x.length > 0);
    if (components.length !== pattern.length) {
        return {
            success: false,
            errmsg: `invalid component part: ${comp}, required: ${pattern.map(x => CPattern[x]).join(" ")}`
        };
    } else {
        return {
            success: true,
            result: <T>components.map((c, idx) => parseComponent(c, pattern[idx]))
        };
    }
}

function processComponents<T extends (REG | IMM | ADDR | LABEL | PSEUDOADDR)[]>(components: string, pattern: CPattern[], processor: (comps: T) => Word): ParseResult {
    const compsResult = parseComponents<T>(components, pattern);
    if (compsResult.success) {
        return {
            success: true,
            word: processor(compsResult.result)
        };
    } else {
        return {
            success: false,
            errmsg: compsResult.errmsg
        };
    }
}

export function genParserREG1(leadingBits: string, followingBits: string): Parser {
    return (components: string): ParseResult => {
        return processComponents<[REG]>(components, [CPattern.REG], (comps: [REG]) => {
            const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum), 5, false);
            return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits).concat(byte.bitsFrom01Str(followingBits));
        });
    };
}

export function genParserREG2(leadingBits: string, followingBits: string): Parser {
    return (components: string): ParseResult => {
        return processComponents<[REG, REG]>(components, [CPattern.REG, CPattern.REG], (comps: [REG, REG]) => {
            const regbits = comps.map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
            return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsFrom01Str(followingBits));
        });
    };
}

export function genParserREG3(leadingBits: string, followingBits: string, reposIdx?: [number, number, number]): Parser {
    return (components: string): ParseResult => {
        return processComponents<[REG, REG, REG]>(components, [CPattern.REG, CPattern.REG, CPattern.REG], (comps: [REG, REG, REG]) => {
            reposIdx = reposIdx || [1, 2, 0];
            const regbits = reposIdx.map(i => comps[i]).map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
            return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(byte.bitsFrom01Str(followingBits));
        });
    };
}

// 2 registers and one 16 bits integer
export function genParserREG2IMM16b(leadingBits: string): Parser {
    return (components: string): ParseResult => {
        return processComponents<[REG, REG, IMM]>(components, [CPattern.REG, CPattern.REG, CPattern.IMM], (comps: [REG, REG, IMM]) => {
            const regbits = (<[REG, REG]>comps.slice(0, 2)).map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
            const imm = comps[2].num;
            return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(encodeIMM(imm, 16));
        });
    };
}

// 1 registers and one 16 bits integer
export function genParserREG1IMM16b(leadingBits: string): Parser {
    return (components: string): ParseResult => {
        return processComponents<[REG, IMM]>(components, [CPattern.REG, CPattern.IMM], (comps: [REG, IMM]) => {
            const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum), 5, false);
            const imm = comps[1].num;
            return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits).concat(encodeIMM(imm, 16));
        });
    };
}

// 2 registers and one 5 bits signed integer
export function genParserREG2IMM5b(leadingBits: string, followingBits: string): Parser {
    return (components: string): ParseResult => {
        return processComponents<[REG, REG, IMM]>(components, [CPattern.REG, CPattern.REG, CPattern.IMM], (comps: [REG, REG, IMM]) => {
            const regbits = (<[REG, REG]>comps.slice(0, 2)).map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
            const imm = comps[2].num;
            return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(encodeIMM(imm, 5)).concat(byte.bitsFrom01Str(followingBits));
        });
    };
}

export function genParserREG1Addr16b(leadingBits: string): Parser {
    return (components: string): ParseResult => {
        return processComponents<[REG, ADDR]>(components, [CPattern.REG, CPattern.ADDR], (comps: [REG, ADDR]) => {
            const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum), 5, false);
            const addrBaseRegBits = byte.bitsNumFill(byte.numToBits(comps[1].regNum), 5, false);
            const imm = comps[1].offset;
            return <Word>byte.bitsFrom01Str(leadingBits).concat(addrBaseRegBits).concat(regbits).concat(encodeIMM(imm, 16));
        });
    };
}

export function genParserREG1LabelOffsetIMM16b(leadingBits: string, followingBits: string): Parser {
    return (components: string, addr: number, labelMap: Map<string, number>, generated?: boolean): ParseResult => {
        return processComponents<[REG, LABEL | IMM]>(components, [CPattern.REG, CPattern.LABEL | CPattern.IMM], (comps: [REG, LABEL | IMM]) => {
            const regbits = byte.bitsNumFill(byte.numToBits(comps[0].regNum), 5, false);
            let imm: number;
            const label = comps[1];
            if (typeof label === "string") {
                if (!labelMap.has(label)) {
                    throw new Error(`label not found: ${label}`);
                }
                const labelAddr = labelMap.get(label);
                imm = (labelAddr - addr) / 4;
            } else {
                if (generated) {
                    if (label.num % 4) {
                        throw new Error(`offset of branch instruction must be a multiple of 4: ${label.num}`);
                    }
                    imm = label.num / 4;
                } else {
                    throw new Error(`branch instruction only accept a label as target address, input is an immediate number: ${label.num}`);
                }
            }
            return <Word>byte.bitsFrom01Str(leadingBits).concat(regbits).concat(byte.bitsFrom01Str(followingBits)).concat(encodeIMM(imm, 16));
        });
    };
}

export function genParserREG2LabelOffsetIMM16b(leadingBits: string): Parser {
    return (components: string, addr: number, labelMap: Map<string, number>, generated?: boolean): ParseResult => {
        return processComponents<[REG, REG, LABEL | IMM]>(components, [CPattern.REG, CPattern.REG, CPattern.LABEL | CPattern.IMM], (comps: [REG, REG, LABEL | IMM]) => {
            const regbits = (<[REG, REG]>comps.slice(0, 2)).map(com => byte.bitsNumFill(byte.numToBits(com.regNum), 5, false));
            let imm: number;
            const label = comps[2];
            if (typeof label === "string") {
                if (!labelMap.has(label)) {
                    throw new Error(`label not found: ${label}`);
                }
                const labelAddr = labelMap.get(label);
                imm = (labelAddr - addr) / 4;
            } else {
                if (generated) {
                    if (label.num % 4) {
                        throw new Error(`offset of branch instruction must be a multiple of 4: ${label.num}`);
                    }
                    imm = label.num / 4;
                } else {
                    throw new Error(`branch instruction only accept a label as target address, input is an immediate number: ${label.num}`);
                }
            }
            return <Word>byte.bitsFrom01Str(leadingBits).concat(flatten(regbits)).concat(encodeIMM(imm, 16));
        });
    };
}

export function genParserLabelIMM26b(leadingBits: string): Parser {
    return (components: string, addr: number, labelMap: Map<string, number>, generated?: boolean): ParseResult => {
        return processComponents<[LABEL | IMM]>(components, [CPattern.LABEL | CPattern.IMM], (comps: [LABEL | IMM]) => {
            let imm: number;
            const label = comps[0];
            if (typeof label === "string") {
                if (!labelMap.has(label)) {
                    throw new Error(`label not found: ${label}`);
                }
                imm = labelMap.get(label) / 4;
            } else {
                if (generated) {
                    if (label.num % 4) {
                        throw new Error(`offset of branch instruction must be a multiple of 4: ${label.num}`);
                    }
                    imm = label.num / 4;
                } else {
                    throw new Error(`branch instruction only accept a label as target address, input is an immediate number: ${label.num}`);
                }
            }
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
    let immBits = byte.numToBits(imm);
    if (immBits.length === (finLen + 1) && !immBits[0]) {
        immBits = immBits.slice(1);
    }
    if (immBits.length > finLen) {
        throw new Error(`unable to encode integer: ${imm} into ${finLen} bits number`);
    }
    return byte.bitsNumFill(immBits, finLen, true);
}
