
import { getRegNumber } from "../registers";
import { UV_UDP_REUSEADDR } from "constants";

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
        if (idx_lparen < 0) {
            // label
            // const
            // label + const
            return parseLabelConst(comp);
        } else {
            // (reg)
            // const(reg)
            // label + const(reg)
            if (comp[comp.length - 1] !== ")") {
                throw new Error(`no matching closing parenthesis: ${comp}`);
            }
            const regstr = comp.slice(idx_lparen + 1, comp.length - 1);
            if (!regstr || regstr === "$" || regstr[0] !== "$") {
                throw new Error(`invalid input for (reg) or const(reg): ${comp}`);
            }
            const regname = regstr.slice(1);
            if (idx_lparen === 0) {
                // (reg)
                return <PSEUDOADDR>{
                    type: PseudoAddr.REG,
                    regName: regname
                };
            } else {
                // const(reg)
                // label + const(reg)
                const leadingtext = comp.slice(0, idx_lparen);
                const leadingparse = parseLabelConst(leadingtext);
                if (leadingparse.type === PseudoAddr.CONST) {
                    return <PSEUDOADDR>{
                        type: PseudoAddr.CONST_REG,
                        num: leadingparse.num,
                        regName: regname
                    };
                } else if (leadingparse.type === PseudoAddr.LABEL_CONST) {
                    return <PSEUDOADDR>{
                        type: PseudoAddr.LABEL_CONST_REG,
                        label: leadingparse.label,
                        num: leadingparse.num,
                        regName: regname
                    };
                } else {
                    throw new Error(`invalid component: ${comp}`);
                }
            }
        }
    }
    throw new Error(`input instruction component does not fall into any given pattern: ${comp}`);
}

function parseLabelConst(comp: string): PSEUDOADDR {
    if (!comp) {
        throw new Error("empty component string is not accepted at parseLabelConst");
    }
    // label
    // const
    // label + const
    const idx_plus = comp.indexOf("+");
    const idx_minus = comp.indexOf("-");
    let idxsign = Math.min(idx_plus, idx_minus);
    if (idxsign < 0) {
        idxsign = Math.max(idx_plus, idx_minus);
    }
    if (idxsign < 0) {
        // const or label
        const num = Number(comp);
        if (isNaN(num)) {
            return <PSEUDOADDR>{
                type: PseudoAddr.LABEL,
                label: comp
            };
        } else {
            return <PSEUDOADDR>{
                type: PseudoAddr.CONST,
                num: num
            };
        }
    } else {
        // const
        // label + const
        const label = comp.slice(0, idxsign).trim();
        // make it work for "label + 100"
        const numStr = comp[idxsign] + comp.slice(idxsign + 1).trim();
        const num = Number(numStr);
        if (isNaN(num)) {
            throw new Error(`invalid input for label+cons or const type of pseudo-addr: ${comp}`);
        }
        if (label) {
            return <PSEUDOADDR>{
                type: PseudoAddr.LABEL_CONST,
                label: label,
                num: num
            };
        } else {
            return <PSEUDOADDR>{
                type: PseudoAddr.CONST,
                num: num
            }
        }
    }
}
