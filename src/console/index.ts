
let _fn: (input: number | string) => void;

export function use(fn: (input: number | string) => void) {
    _fn = fn;
}

export function write(input: number | string) {
    if (!_fn) {
        throw new Error(`no implementation for console.write, use console.use to register a handler function`);
    }
    _fn(input);
}
