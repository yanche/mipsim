
import { Byte, Bit } from "../def";
import { MIPSError, SyntaxErrorCode } from "../error";
import { byte, validate, range, parseAsciiStr } from "../utility";

export function parseDataAllocation(directive: string, addr: number): Byte[] {
    directive = directive.trim();
    const spaceIdx = directive.indexOf(" ");
    const cmd = directive.slice(0, spaceIdx);
    const comp = directive.slice(spaceIdx + 1).trim();
    const parser = map.get(cmd);
    if (parser) {
        return parser(comp, addr);
    } else {
        throw new MIPSError(`given directive is not a data allocation command: ${directive}`, SyntaxErrorCode.INVALID_ASSEMBLY);
    }
}

export interface DataDirectiveParser {
    (comp: string, addr: number): Byte[];
}

const map = new Map<string, DataDirectiveParser>();

export const ascii = (comp: string, addr: number, tail0?: boolean) => {
    comp = comp.trim();
    if (comp[0] === '"' && comp[comp.length - 1] === '"') {
        const asciiStr = comp.slice(1, -1);
        if (asciiStr.length === 0 || asciiStr === "\\") {
            throw new MIPSError(`ascii content cannot be empty or only \\: ${asciiStr}`, SyntaxErrorCode.INVALID_COMPONENT);
        }
        let { result, err } = parseAsciiStr(asciiStr);
        if (err) {
            throw new MIPSError(`failed to parse asciistr: ${asciiStr}`, SyntaxErrorCode.INVALID_COMPONENT);
        }
        if (tail0) {
            result = result.concat([byte.makeByte0()]);
        }
        return result;
    } else {
        throw new MIPSError(`invalid input for ${tail0 ? ".asciiz" : ".ascii"}: ${comp}`, SyntaxErrorCode.INVALID_COMPONENT);
    }
};
map.set(".ascii", ascii);

export const asciiz = (comp: string, addr: number) => {
    return ascii(comp, addr, true);
}
map.set(".asciiz", asciiz);

export const _byte = createParser((comp: string) => {
    return parseUnsignedNumStrToBits(comp, 1);
});
map.set(".byte", _byte);

export const half = createParser((comp: string) => {
    return parseUnsignedNumStrToBits(comp, 2);
});
map.set(".half", half);

export const word = createParser((comp: string) => {
    return parseUnsignedNumStrToBits(comp, 4);
});
map.set(".word", word);

export const align = createParser((comp: string, addr: number) => {
    if (comp !== "1" && comp !== "2") {
        throw new MIPSError(`invalid value for .align directive: ${comp}, currently only allow 1 or 2`, SyntaxErrorCode.INVALID_COMPONENT);
    }
    const base = Math.pow(2, Number(comp)); // 2 or 4
    return range((base - (addr % base)) % base).result.map(byte.makeByte0);
});
map.set(".align", align);

export const space = createParser((comp: string, addr: number) => {
    const count = parseUnsignedNumStr(comp);
    return range(count).result.map(byte.makeByte0);
});
map.set(".space", space);

function createParser(core: DataDirectiveParser): DataDirectiveParser {
    return function (comp: string, addr: number) {
        return core(comp.trim(), addr);
    }
}

function bitsToBytes(bits: Bit[]): Byte[] {
    return range(bits.length / 8).result.map((n, idx) => {
        return <Byte>bits.slice(idx * 8, idx * 8 + 8);
    });
}

function parseUnsignedNumStrToBits(input: string, bytes: 1 | 2 | 4): Byte[] {
    const { bits, err } = byte.bitsFromHexStr(input);
    if (err) {
        throw new MIPSError(`fail to parse hex string: ${input}`, SyntaxErrorCode.INVALID_COMPONENT);
    }
    if (bits.length !== 8 * bytes) {
        throw new MIPSError(`fail to encode hex string: ${input} into ${bytes} bytes`, SyntaxErrorCode.INVALID_COMPONENT);
    }
    return bitsToBytes(bits);
}

function parseUnsignedNumStr(input: string): number {
    const num = parseInt(input);
    if (isNaN(num) || num < 0 || !validate.num(num, validate.NUM_FLAG.INT)) {
        throw new MIPSError(`invalid unsigned number string: ${input}`, SyntaxErrorCode.INVALID_NUM);
    }
    return num;
}
