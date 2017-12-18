
import * as validate from "./validate";
import * as byte from "./byte";
import { Byte } from "../def";

export { validate, byte };

export function flatten<T>(arr: Array<T | Array<T>>): Array<T> {
    return Array.prototype.concat.apply([], arr);
}

export function findFirst<T>(arr: T[], predicate: (item: T, idx: number) => boolean, def: T): T {
    for (let i = 0; i < arr.length; ++i) {
        if (predicate(arr[i], i)) {
            return arr[i];
        }
    }
    return def;
}

export function range(total: number): { err?: string; result?: number[] };
export function range(start: number, end?: number): { err?: string; result?: number[] } {
    let startReq = validate.NUM_FLAG.INT;
    if (end === undefined) {
        startReq |= validate.NUM_FLAG.NONNEG;
    } else {
        if (!validate.num(end, validate.NUM_FLAG.INT)) {
            return { err: `end is not an integer: ${end}` };
        }
        if (start > end) {
            return { err: `start is greater than end, start: ${start}, end: ${end}` };
        }
    }
    if (!validate.num(start, startReq)) {
        return { err: `start is not a valid integer: ${start}` };
    }
    if (end === undefined) {
        end = start;
        start = 0;
    }
    const ret = new Array(end - start);
    for (let i = 0; i < end - start; ++i) {
        ret[i] = start + i;
    }
    return { result: ret };
}

const ch_slash = "\\".charCodeAt(0);
const escapeMap = new Map<string, number>();
escapeMap.set("a", 7);
escapeMap.set("b", 8);
escapeMap.set("f", 12);
escapeMap.set("n", 10);
escapeMap.set("r", 13);
escapeMap.set("t", 9);
escapeMap.set("v", 11);
escapeMap.set("\\", 92);
escapeMap.set("?", 63);
escapeMap.set("'", 39);
escapeMap.set("\"", 34);
const ch_0 = "0".charCodeAt(0);
const ch_7 = "7".charCodeAt(0);
const ch_9 = "9".charCodeAt(0);
const ch_a = "a".charCodeAt(0);
const ch_f = "f".charCodeAt(0);
export function parseAsciiStr(input: string): { result?: Byte[]; err?: string } {
    const len = input.length;
    const ret: Byte[] = [];
    let idx = 0;
    while (idx < len) {
        const ch = input.charCodeAt(idx);
        if (ch === ch_slash) {
            if (idx < len - 1) {
                const next = input[idx + 1];
                const nextch = next.charCodeAt(0);
                // \x is case sensitive
                if (next === "x") {
                    const next2nums = input.slice(idx + 2, idx + 4).toLowerCase();
                    if (next2nums.length === 2 && next2nums.split("").every(q => {
                        const c = q.toLowerCase().charCodeAt(0);
                        return (ch_0 <= c && c <= ch_9) || (ch_a <= c && c <= ch_f);
                    })) {
                        ret.push(<Byte>byte.bitsNumFill(byte.numToBits(parseInt(next2nums, 16)).result, 8, false).bits);
                        idx += 3;
                    } else {
                        return { err: `Invalid hexadecimal escape sequence: ${next2nums}` };
                    }
                } else if (ch_0 <= nextch && nextch <= ch_7) {
                    let num = nextch - ch_0;
                    let tmpidx = idx + 2;
                    while (tmpidx < len && tmpidx <= idx + 3) {
                        const chcode = input.charCodeAt(tmpidx);
                        if (ch_0 <= chcode && chcode <= ch_7) {
                            const newnum = num * 8 + (chcode - ch_0);
                            if (newnum <= 255) {
                                num = newnum;
                                ++tmpidx;
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    ret.push(<Byte>byte.bitsNumFill(byte.numToBits(num).result, 8, false).bits);
                    idx = tmpidx - 1;
                } else {
                    if (escapeMap.has(next)) {
                        ret.push(<Byte>byte.bitsNumFill(byte.numToBits(escapeMap.get(next)).result, 8, false).bits);
                        ++idx;
                    }
                    // else, ignore the non-matching \
                }
            }
            // ignore the last \
        } else {
            ret.push(<Byte>byte.bitsNumFill(byte.numToBits(ch).result, 8, false).bits);
        }
        ++idx;
    }
    return { result: ret };
}

export interface DirtyInfo<TKey, TVal> {
    key: TKey;
    old: TVal;
    new: TVal;
}

export class DirtyTracker<TKey, TVal> {
    private _tracker: Map<TKey, DirtyInfo<TKey, TVal>>;
    private _equals: (v1: TVal, v2: TVal) => boolean;

    constructor(equals: (v1: TVal, v2: TVal) => boolean) {
        this._tracker = new Map<TKey, DirtyInfo<TKey, TVal>>();
        this._equals = equals;
    }

    public track(key: TKey, oldval: TVal, newval: TVal): void {
        if (!this._tracker.has(key)) {
            this._tracker.set(key, {
                key: key,
                old: oldval,
                new: newval,
            });
        } else {
            this._tracker.get(key).new = newval;
        }
    }

    public getDirtyInfo(): DirtyInfo<TKey, TVal>[] {
        return [...this._tracker].map(b => b[1]).filter(b => !this._equals(b.old, b.new));
    }

    public clear(): void {
        this._tracker.clear();
    }
}
