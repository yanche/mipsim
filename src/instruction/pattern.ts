
import { getRegNumber } from "../registers";

export enum InstructionComponentPattern {
    REG = 1,
    IMM = 2,
    ADDR = 4,
    LABEL = 8
}

export interface REG {
    regNum: number;
}

export interface IMM {
    num: number;
}

export interface ADDR {
    regNum: number;
    offset: number;
}

export type LABEL = string;

export function parseComponent(comp: string, pattern: InstructionComponentPattern): REG | IMM | ADDR | LABEL {
    if (InstructionComponentPattern.REG & pattern) {
        if (comp[0] === "$") {
            const regnum = getRegNumber(comp.slice(1));
            if (regnum === undefined) {
                throw new Error(`invalid register: ${comp}`);
            } else if (regnum < 0 || regnum > 31) {
                throw new Error(`invalid register for operation: ${comp}`);
            } else {
                return <REG>{
                    regNum: regnum
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
    throw new Error(`input instruction component does not fall into any given pattern: ${comp}`);
}
