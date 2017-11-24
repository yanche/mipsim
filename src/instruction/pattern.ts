
import { getRegNumber } from "../registers";
import { MIPSError, SyntaxErrorCode } from "../error";
import { validate } from "../utility/index";

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
    comp = comp.trim();
    if (!comp) {
        throw new Error(`empty component string is not accepted when parsing`);
    }
    if (InstructionComponentPattern.REG & pattern) {
        if (comp[0] === "$") {
            const regname = comp.slice(1);
            return <REG>{
                regNum: getRegNum(regname, comp),
                regName: regname
            };
        }
    }
    if (InstructionComponentPattern.IMM & pattern) {
        const num = Number(comp);
        if (!isNaN(num)) {
            validateIntOrThrow(num, comp);
            return <IMM>{
                num: num
            };
        }
    }
    if (InstructionComponentPattern.ADDR & pattern) {
        const idx = comp.indexOf("(");
        if (idx >= 0 && comp[comp.length - 1] === ")") {
            const num = Number(comp.slice(0, idx));
            const regstr = comp.slice(idx + 1, comp.length - 1);
            if (regstr[0] === "$" && !isNaN(num)) {
                return <ADDR>{
                    regNum: getRegNum(regstr.slice(1), comp),
                    offset: num
                };
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
                throw new MIPSError(`no matching closing parenthesis: ${comp}`, SyntaxErrorCode.SYNTAX_ERROR);
            }
            const regstr = comp.slice(idx_lparen + 1, comp.length - 1);
            if (!regstr || regstr === "$" || regstr[0] !== "$") {
                throw new MIPSError(`syntax error on register: ${comp}`, SyntaxErrorCode.SYNTAX_ERROR);
            }
            const regname = regstr.slice(1);
            // try getRegNum, may throw exception
            getRegNum(regname, comp);
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
                    throw new MIPSError(`unknown instruction component: ${comp} for pseudo-addr pattern`, SyntaxErrorCode.UNKNOWN_INSTRUCTION);
                }
            }
        }
    }
    throw new MIPSError(`unknown instruction component: ${comp} for given pattern, ${pattern}`, SyntaxErrorCode.UNKNOWN_INSTRUCTION);
}

function validateIntOrThrow(num: number, comp: string) {
    if (!validate.num(num, validate.NUM_FLAG.INT)) {
        throw new MIPSError(`only accept integer: ${comp}`, SyntaxErrorCode.IMM_NOT_INTEGER);
    }
}

function parseLabelConst(comp: string): PSEUDOADDR {
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
            validateIntOrThrow(num, comp);
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
            throw new MIPSError(`unknown instruction component of pseudo-addr: ${comp}`, SyntaxErrorCode.UNKNOWN_INSTRUCTION);
        }
        validateIntOrThrow(num, comp);
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

function getRegNum(regname: string, comp: string): number {
    const regnum = getRegNumber(regname);
    if (regnum === undefined) {
        throw new MIPSError(`invalid register: ${comp}`, SyntaxErrorCode.INVALID_REGISTER);
    } else if (regnum < 0 || regnum > 31) {
        throw new MIPSError(`invalid register for operation: ${comp}`, SyntaxErrorCode.INACCESSIBLE_REGISTER);
    } else {
        return regnum;
    }
}
