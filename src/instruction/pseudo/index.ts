
import { getHandler } from "./handlers";

export function pseudoCodeConv(code: string, labelMap: Map<string, number>): string[] {
    const split = splitCode(code);
    const handler = getHandler(split.cmd);
    if (handler) {
        return handler.conv(split.comp, labelMap);
    } else {
        throw new Error(`handler not found for ${split.cmd}`);
    }
}

export function pseudoGetCount(code: string): number {
    const split = splitCode(code);
    const handler = getHandler(split.cmd);
    if (handler) {
        return handler.getCount(split.comp);
    } else {
        throw new Error(`handler not found for ${split.cmd}`);
    }
}

export function isPesudoInstruction(code: string): boolean {
    return !!getHandler(splitCode(code).cmd);
}

function splitCode(code: string): { cmd: string; comp: string } {
    code = code.trim();
    const splitter = code.indexOf(" ");
    return {
        cmd: (splitter === -1 ? code : code.slice(0, splitter)).trim(),
        comp: (splitter === -1 ? "" : code.slice(splitter + 1)).trim()
    };
}
