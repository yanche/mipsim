
import { getRegNumber } from "../registers";

export enum InstructionComponentPattern {
    REG = 1,
    IMM = 2,
    ADDR = 4,
    LABEL = 8,
    PSEUDOADDR = 16
}

export interface REG {
    regNum: number;
    regName: string;
}

export interface IMM {
    num: number;
}

export interface ADDR {
    regNum: number;
    offset: number;
}

export enum PseudoAddr {
    REG,
    CONST,
    CONST_REG,
    LABEL,
    LABEL_CONST,
    LABEL_CONST_REG,
}

export interface PSEUDOADDR {
    type: PseudoAddr;
    num?: number;
    label?: string;
    regName?: string;
}

export type LABEL = string;

export function parseComponent(comp: string, pattern: InstructionComponentPattern): REG | IMM | ADDR | LABEL | PSEUDOADDR {
    if (InstructionComponentPattern.REG & pattern) {
        if (comp[0] === "$") {
            const regname = comp.slice(1);
            const regnum = getRegNumber(regname);
            if (regnum === undefined) {
                throw new Error(`invalid register: ${comp}`);
            } else if (regnum < 0 || regnum > 31) {
                throw new Error(`invalid register for operation: ${comp}`);
            } else {
                return <REG>{
                    regNum: regnum,
                    regName: regname
                };
            }
        }
    }
    if (InstructionComponentPattern.IMM & pattern) {
        const num = Number(comp);
        if (!isNaN(num)) {
            return <IMM>{
                num: num
            };
        }
    }
    if (InstructionComponentPattern.ADDR & pattern) {
        const idx = comp.indexOf("(");
        if (idx >= 0 && idx < comp.length - 1 && comp[comp.length - 1] === ")") {
            const num = Number(comp.slice(0, idx));
            const regstr = comp.slice(idx + 1, comp.length - 1);
            if (regstr[0] === "$" && !isNaN(num)) {
                const regnum = getRegNumber(regstr.slice(1));
                if (regnum === undefined) {
                    throw new Error(`invalid register: ${comp}`);
                } else {
                    return <ADDR>{
                        regNum: regnum,
                        offset: num
                    };
                }
            }
        }
    }
    if (InstructionComponentPattern.LABEL & pattern) {
        return comp;
    }
    if (InstructionComponentPattern.PSEUDOADDR & pattern) {
        const idx_lparen = comp.indexOf("(");
        const idx_plus = comp.indexOf("+");
        if (idx_lparen < 0 && idx_plus < 0) {
            const num = Number(comp);
            if (isNaN(num)) {
                return <PSEUDOADDR>{
                    type: PseudoAddr.LABEL,
                    label: comp
                }
            } else {
                return <PSEUDOADDR>{
                    type: PseudoAddr.CONST,
                    num: num
                }
            }
        } else if (idx_lparen < 0) {
            // label + const
            const label = comp.slice(0, idx_plus).trim();
            const numStr = comp.slice(idx_plus + 1).trim();
            const num = Number(numStr);
            if (!label || !numStr || isNaN(num)) {
                throw new Error(`invalid input for label+cons type of pseudo-addr: ${comp}`);
            }
            return <PSEUDOADDR>{
                type: PseudoAddr.LABEL_CONST,
                label: label,
                num: num
            };
        } else if (idx_plus < 0) {
            // (reg) or const(reg)
            if (comp[comp.length - 1] !== ")") {
                throw new Error(`no matching closing parenthesis: ${comp}`);
            }
            const numStr = comp.slice(0, idx_lparen).trim();
            const num = Number(numStr);
            const regstr = comp.slice(idx_lparen + 1, comp.length - 1);
            if ((numStr && isNaN(num)) || !regstr || regstr === "$") {
                throw new Error(`invalid input for (reg) or const(reg): ${comp}`);
            }
            if (regstr[0] === "$") {
                const regName = regstr.slice(1);
                if (numStr) {
                    return <PSEUDOADDR>{
                        type: PseudoAddr.CONST_REG,
                        num: num,
                        regName: regName
                    };
                } else {
                    return <PSEUDOADDR>{
                        type: PseudoAddr.REG,
                        regName: regName
                    };
                }
            } else {
                throw new Error(`bad register format: ${comp}, ${regstr}`);
            }
        } else {
            if (comp[comp.length - 1] !== ")") {
                throw new Error(`no matching closing parenthesis: ${comp}`);
            }
            // label + const(reg) 
            const label = comp.slice(0, idx_plus).trim();
            const numstr = comp.slice(idx_plus + 1, idx_lparen).trim();
            const regstr = comp.slice(idx_lparen + 1, comp.length - 1).trim();
            const num = Number(numstr);
            if (!label || !numstr || isNaN(num) || !regstr || regstr === "$") {
                throw new Error(`invalid input for label+cons(reg) type of pseudo-addr: ${comp}`);
            }
            if (regstr[0] === "$") {
                const regName = regstr.slice(1);
                return <PSEUDOADDR>{
                    type: PseudoAddr.LABEL_CONST_REG,
                    label: label,
                    num: num,
                    regName: regName
                };
            } else {
                throw new Error(`bad register format: ${comp}, ${regstr}`);
            }
        }
    }
    throw new Error(`input instruction component does not fall into any given pattern: ${comp}`);
}
