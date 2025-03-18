declare module 'merge-json' {
  interface MergeJSON {
    merge<T extends Record<string, unknown>>(target: T, source: T): T;
  }
  const mergeJSON: MergeJSON;
  export default mergeJSON;
}
