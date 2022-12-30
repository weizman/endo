/** @typedef {import('@endo/pass-style').Remotable} Remotable */

/**
 * @template N
 * @template R
 * @typedef {object} Builder
 * @property {(node: N) => R} buildRoot
 *
 * @property {() => N} buildUndefined
 * @property {() => N} buildNull
 * @property {(num: number) => N} buildNumber
 * @property {(flag: boolean) => N} buildBoolean
 * @property {(bigint: bigint) => N} buildBigint
 * @property {(str: string) => N} buildString
 * @property {(sym: symbol) => N} buildSymbol
 *
 * @property {(builtEntries: [string, N][]) => N} buildRecord
 * The recognizer must pass the actual property names through. It is
 * up to the builder whether it wants to encode them.
 * It is up to the recognizer to sort the entries by their actual
 * property name first, and to encode their values in the resulting
 * sorted order. The builder may assume that sorted order.
 * @property {(builtElements: N[]) => N} buildArray
 * @property {(tagName: string, builtPayload: N) => N} buildTagged
 * The recognizer must pass the actual tagName through. It is
 * up to the builder whether it wants to encode it.
 *
 * @property {(error :Error) => N} buildError
 * @property {(remotable: Remotable) => N} buildRemotable
 * @property {(promise: Promise) => N} buildPromise
 */

/**
 * @template E
 * @template N
 * @template R
 * @callback Recognize
 * @param {E} encoding
 * @param {Builder<N,R>} builder
 * @returns {R}
 */
