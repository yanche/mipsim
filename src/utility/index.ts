
import * as validate from "./validate";
import * as byte from "./byte";

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
