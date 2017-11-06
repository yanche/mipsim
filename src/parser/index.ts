
import Memory from "../memory";
import { parse } from "../instruction";
import { pseudoCodeRepl, PseudoCodePostProcess } from "../instruction/pseudo";
import { validate, byte, parseAsciiStr, flatten } from "../utility";
import { Word, Bit, Byte, HalfWord } from "../def";

interface CodeContext {
    textSeg: boolean;
    dataPtr: number;
    textPtr: number;
    labelMap: Map<string, number>;
}

interface CodeLineRep {
    code: string;
    generated: boolean;
}

function makeCodeLineRep(code: string, generated: boolean): CodeLineRep {
    return {
        code: code,
        generated: generated
    };
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
    const pseudoReplCollector = new Array<CodeLineRep[] | PseudoCodePostProcess>(len);
    let i = 0;
    while (i < len) {
        const pseudoReplResult = pseudoCodeRepl(codelines[i]);
        if (!pseudoReplResult.success) {
            throw new Error(pseudoReplResult.errmsg);
        }
        if (Array.isArray(pseudoReplResult.code)) {
            pseudoReplCollector[i] = pseudoReplResult.code.map(m => makeCodeLineRep(m, !pseudoReplResult.native));
        } else {
            pseudoReplCollector[i] = pseudoReplResult.code;
        }
        ++i;
    }
    const postReplCodelines = flatten<PseudoCodePostProcess | CodeLineRep>(pseudoReplCollector);
    len = postReplCodelines.length;
    i = 0;
    while (i < len) {
        // first loop, label & data segment
        parseNonTextCodeLine(postReplCodelines[i++], ctx, mem);
    }
    i = 0;
    const pseudoPostProcesslCollector = new Array<CodeLineRep[] | CodeLineRep>(len);
    while (i < len) {
        // first loop, label & data segment
        const codeline = postReplCodelines[i];
        if (!isCodeLineRep(codeline)) {
            if (!ctx.labelMap.has(codeline.label)) {
                throw new Error(`label not found: ${codeline.label}`);
            }
            pseudoPostProcesslCollector[i] = codeline.process(ctx.labelMap.get(codeline.label)).map(c => makeCodeLineRep(c, true));
        } else {
            pseudoPostProcesslCollector[i] = codeline;
        }
        ++i;
    }
    const pseudoPostProcessCodelines = flatten(pseudoPostProcesslCollector);
    len = pseudoPostProcessCodelines.length;
    i = 0;
    ctx.textSeg = true;
    ctx.textPtr = firstInstAddr + 4;
    while (i < len) {
        // second loop, instruction(text) segment
        const crep = pseudoPostProcessCodelines[i++];
        parseTextCodeLine(crep.code, crep.generated, ctx, mem);
    }
    if (!ctx.labelMap.has("main")) {
        throw new Error(`main label was not declared`);
    }
    // first instruction is J main
    mem.writeWord(numPtrToAddr(firstInstAddr), parse("j main", firstInstAddr, ctx.labelMap).word);
    return mem;
}

function parseTextCodeLine(codeline: string, generated: boolean, ctx: CodeContext, mem: Memory): void {
    codeline = (codeline || "").trim();
    if (codeline.length === 0 || codeline[0] === "#") return; // comment starts with #
    if (codeline === ".data") {
        ctx.textSeg = false;
        return;
    }
    if (codeline === ".text") {
        ctx.textSeg = true;
        return;
    }
    if (ctx.textSeg && codeline[codeline.length - 1] !== ":") {
        const parseResult = parse(codeline, ctx.textPtr, ctx.labelMap, generated);
        if (!parseResult.success) {
            throw new Error(parseResult.errmsg);
        }
        const bits = parseResult.word;
        mem.writeWord(numPtrToAddr(ctx.textPtr), bits);
        ctx.textPtr += 4;
        return;
    }
}

function isCodeLineRep(codeline: CodeLineRep | PseudoCodePostProcess): codeline is CodeLineRep {
    return typeof (<any>codeline).code === "string";
}

function parseNonTextCodeLine(codeline: CodeLineRep | PseudoCodePostProcess, ctx: CodeContext, mem: Memory): void {
    if (isCodeLineRep(codeline)) {
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
                throw new Error(`invalid code line in text segment: ${code}`);
            }
        }
        if (code[code.length - 1] === ":") {
            // define a label, case sensitive
            const label = code.slice(0, -1);
            if (validate.label(label)) {
                if (ctx.labelMap.has(label)) {
                    throw new Error(`label already delcared: ${label}`);
                } else {
                    ctx.labelMap.set(label, ctx.textSeg ? ctx.textPtr : ctx.dataPtr);
                    return;
                }
            } else {
                throw new Error(`invalid label: ${label}`);
            }
        }
        if (ctx.textSeg) {
            // just move the counter but don't process instructions, we need go thru first loop for labels.
            ctx.textPtr += 4;
            return;
        }
        throw new Error(`unknown codeline in given context: ${code}`);
    } else {
        if (ctx.textSeg) {
            // just move the counter but don't process instructions, we need go thru first loop for labels.
            ctx.textPtr += 4 * codeline.count;
            return;
        }
        throw new Error(`PseudoCodePostProcess indicates a set of instructions converted from pseudo-instruction, cannot be part of .data segment`);
    }
}

function numPtrToAddr(ptr: number): Word {
    return <Word>byte.bitsNumFill(byte.numToBits(ptr), 32, false);
}

function parseDataAssign(codeline: string, ctx: CodeContext, mem: Memory): void {
    // .asciiz
    const spaceIdx = codeline.indexOf(" ");
    const directive = codeline.slice(0, spaceIdx);
    const content = codeline.slice(spaceIdx).trim();
    if (spaceIdx === -1 || content.length === 0) {
        throw new Error(`invalid code line in data segment: ${codeline}`);
    }
    let tail0 = false;
    switch (directive) {
        case ".asciiz":
            tail0 = true;
        case ".ascii":
            if (content[0] === '"' && content[content.length - 1] === '"') {
                const asciiStr = content.slice(1, -1);
                if (asciiStr.length === 0 || asciiStr === "\\") {
                    throw new Error(`ascii content cannot be empty or only \\: ${asciiStr}`);
                }
                for (let b of parseAsciiStr(asciiStr)) {
                    mem.writeByte(numPtrToAddr(ctx.dataPtr++), b);
                }
                if (tail0) {
                    mem.writeByte(numPtrToAddr(ctx.dataPtr++), byte.makeByte0());
                }
            } else {
                throw new Error(`invalid input for .asciiz and .ascii: ${content}`);
            }
            return;
        case ".byte":
            mem.writeByte(numPtrToAddr(ctx.dataPtr++), <Byte>parseUnsignedNumStrToBits(content, 8));
            return;
        case ".half":
            mem.writeHalfWord(numPtrToAddr(ctx.dataPtr), <HalfWord>parseUnsignedNumStrToBits(content, 16));
            ctx.dataPtr += 2;
            return;
        case ".word":
            mem.writeWord(numPtrToAddr(ctx.dataPtr), <Word>parseUnsignedNumStrToBits(content, 32));
            ctx.dataPtr += 4;
            return;
        case ".align":
            if (content !== "1" && content !== "2") {
                throw new Error(`invalid value for .align directive: ${content}, currently only allow 1 or 2`);
            }
            const base = Math.pow(2, Number(content)); // 2 or 4
            if ((ctx.dataPtr % base) !== 0) {
                ctx.dataPtr += (base - (ctx.dataPtr % base));
            }
            return;
        case ".space":
            ctx.dataPtr += parseUnsignedNumStr(content);
            return;
        default: throw new Error(`unknown directive: ${directive}`);
    }
}

function parseUnsignedNumStrToBits(input: string, bitsLen: number): Bit[] {
    const num = parseUnsignedNumStr(input);
    if (num >= Math.pow(2, bitsLen)) {
        throw new Error(`failed to parse number string within bounds: ${input}, bits-length requirement: ${bitsLen}`);
    }
    return byte.bitsNumFill(byte.numToBits(num), bitsLen, false);
}

function parseUnsignedNumStr(input: string): number {
    const num = parseInt(input, input.slice(0, 2) === "0x" ? 16 : 10);
    if (isNaN(num) || num < 0) {
        throw new Error(`invalid unsigned number string: ${input}`);
    }
    return num;
}
