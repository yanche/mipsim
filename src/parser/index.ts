
import Memory from "../memory";
import { parse } from "../instruction";
import { isPesudoInstruction, pseudoGetCount, pseudoCodeConv } from "../instruction/pseudo";
import { validate, byte } from "../utility";
import { Word } from "../def";
import { MIPSError, SyntaxErrorCode } from "../error";
import { parseDataAllocation } from "./dataalloc";

interface CodeContext {
    textSeg: boolean;
    dataPtr: number;
    textPtr: number;
    labelMap: Map<string, number>;
}

interface CodeLineRep {
    code: string;
    pseudo: boolean;
    targetCount: number;
}

function processAndCatchMIPSError(cb: () => void, lineNum: number) {
    try {
        cb();
    }
    catch (err) {
        if (err instanceof MIPSError) {
            err.lineNum = lineNum;
        }
        throw err;
    }
}

export function parseMIPSCode(codelines: string[]): Memory {
    const firstInstAddr = parseInt("0x00400000", 16);
    const ctx: CodeContext = {
        textSeg: true, // by default in text segment
        dataPtr: parseInt("0x10000000", 16),
        textPtr: firstInstAddr + 4,
        labelMap: new Map<string, number>()
    };
    const mem = new Memory();
    let len = codelines.length;
    const pseudoReplCollector = new Array<CodeLineRep>(len);
    let i = 0;
    while (i < len) {
        // first loop, get the total count of instructions
        // some instructions may be converted from pseudo instructions
        processAndCatchMIPSError(() => {
            const code = codelines[i];
            const pseudo = isPesudoInstruction(code);
            pseudoReplCollector[i] = {
                code: code,
                pseudo: pseudo,
                targetCount: pseudo ? pseudoGetCount(code) : 1
            };
        }, i);
        ++i;
    }
    i = 0;
    while (i < len) {
        // second loop, label & data segment
        processAndCatchMIPSError(() => {
            parseNonTextCodeLine(pseudoReplCollector[i], ctx, mem);
        }, i);
        ++i;
    }
    i = 0;
    ctx.textSeg = true;
    ctx.textPtr = firstInstAddr + 4;
    while (i < len) {
        // third loop, instruction(text) segment
        processAndCatchMIPSError(() => {
            parseTextCodeLine(pseudoReplCollector[i], ctx, mem);
        }, i);
        ++i;
    }
    if (!ctx.labelMap.has("main")) {
        throw new MIPSError("main label was not declared", SyntaxErrorCode.NO_ENTRY);
    }
    // first instruction is J main
    mem.writeWord(numPtrToAddr(firstInstAddr), parse("j main", firstInstAddr, ctx.labelMap));
    return mem;
}

function parseTextInstruction(code: string, generated: boolean, ctx: CodeContext, mem: Memory): void {
    code = (code || "").trim();
    if (code.length === 0 || code[0] === "#") return; // comment starts with #
    if (code === ".data") {
        ctx.textSeg = false;
        return;
    }
    if (code === ".text") {
        ctx.textSeg = true;
        return;
    }
    if (ctx.textSeg && code[code.length - 1] !== ":") {
        const bits = parse(code, ctx.textPtr, ctx.labelMap, generated);
        mem.writeWord(numPtrToAddr(ctx.textPtr), bits);
        ctx.textPtr += 4;
        return;
    }
}

function parseTextCodeLine(codeline: CodeLineRep, ctx: CodeContext, mem: Memory): void {
    if (codeline.pseudo) {
        const pseudoConv = pseudoCodeConv(codeline.code, ctx.labelMap);
        if (pseudoConv.length !== codeline.targetCount) {
            throw new Error(`pseudo instruction does not converted into expected number of instructions: ${codeline.code}, expected: ${codeline.targetCount}, actual: ${pseudoConv.length} \r\n${pseudoConv.join("\r\n")}`)
        } else {
            pseudoConv.forEach(p => parseTextInstruction(p, true, ctx, mem));
        }
    } else {
        parseTextInstruction(codeline.code, false, ctx, mem);
    }
}

function parseNonTextCodeLine(codeline: CodeLineRep, ctx: CodeContext, mem: Memory): void {
    if (!codeline.pseudo) {
        const code = (codeline.code || "").trim();
        if (code.length === 0 || code[0] === "#") return; // comment starts with #
        if (code[0] === ".") {
            if (code === ".data") {
                ctx.textSeg = false;
                return;
            } else if (code === ".text") {
                ctx.textSeg = true;
                return;
            } else if (!ctx.textSeg) {
                parseDataAssign(code, ctx, mem);
                return;
            } else {
                throw new MIPSError(`invalid code line in text segment: ${code}`, SyntaxErrorCode.UNKNOWN_ASSEMBLY);
            }
        }
        if (code[code.length - 1] === ":") {
            // define a label, case sensitive
            const label = code.slice(0, -1);
            if (validate.label(label)) {
                if (ctx.labelMap.has(label)) {
                    throw new MIPSError(`label already delcared: ${label}`, SyntaxErrorCode.LABEL_DECLARED);
                } else {
                    ctx.labelMap.set(label, ctx.textSeg ? ctx.textPtr : ctx.dataPtr);
                    return;
                }
            } else {
                throw new MIPSError(`invalid label: ${label}`, SyntaxErrorCode.INVALID_LABEL);
            }
        }
        if (ctx.textSeg) {
            // just move the counter but don't process instructions, we need go thru first loop for labels.
            ctx.textPtr += 4;
            return;
        }
        throw new MIPSError(`unknown codeline in given context: ${code}`, SyntaxErrorCode.UNKNOWN_ASSEMBLY);
    } else {
        if (ctx.textSeg) {
            // just move the counter but don't process instructions, we need go thru first loop for labels.
            ctx.textPtr += 4 * codeline.targetCount;
            return;
        }
        throw new MIPSError(`data segment cannot contain instructions`, SyntaxErrorCode.INSTRUCTION_DATA_SEGMENT);
    }
}

function numPtrToAddr(ptr: number): Word {
    return <Word>byte.bitsNumFill(byte.numToBits(ptr).result, 32, false).bits;
}

function parseDataAssign(codeline: string, ctx: CodeContext, mem: Memory): void {
    // .asciiz
    const data = parseDataAllocation(codeline, ctx.dataPtr);
    for (let i = 0; i < data.length; ++i) {
        mem.writeByte(numPtrToAddr(ctx.dataPtr++), data[i]);
    }
}
