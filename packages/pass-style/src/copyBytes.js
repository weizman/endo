/// <reference types="ses"/>

import { assertChecker } from './passStyle-helpers.js';

/** @typedef {import('./types.js').CopyBytes} CopyBytes */

const { Fail } = assert;
const { setPrototypeOf } = Object;
const { apply } = Reflect;

/**
 * @type {WeakSet<CopyBytes>}
 */
const genuineCopyBytes = new WeakSet();

const slice = ArrayBuffer.prototype.slice;
const sliceOf = (buffer, start, end) => apply(slice, buffer, [start, end]);

/**
 * A CopyBytes is much like an ArrayBuffer, but immutable.
 * It cannot be used as an ArrayBuffer argument when a genuine ArrayBuffer is
 * needed. But a `copyBytes.slice()` is a genuine ArrayBuffer, initially with
 * a copy of the copyByte's data.
 *
 * On platforms that support freezing ArrayBuffer, like perhaps a future XS,
 * (TODO) the intention is that `copyBytes` could hold on to a single frozen
 * one and return it for every call to `arrayBuffer.slice`, rather than making
 * a fresh copy each time.
 *
 * @param {ArrayBuffer} arrayBuffer
 * @returns {CopyBytes}
 */
export const makeCopyBytes = arrayBuffer => {
  try {
    // Both validates and gets an exclusive copy.
    // This `arrayBuffer` must not escape, to emulate immutability.
    arrayBuffer = sliceOf(arrayBuffer);
  } catch {
    Fail`Expected genuine ArrayBuffer" ${arrayBuffer}`;
  }
  /** @type {CopyBytes} */
  const copyBytes = {
    // Can't say it this way because it confuses TypeScript
    // __proto__: ArrayBuffer.prototype,
    byteLength: arrayBuffer.byteLength,
    slice(start, end) {
      return sliceOf(arrayBuffer, start, end);
    },
    [Symbol.toStringTag]: 'CopyBytes',
  };
  setPrototypeOf(copyBytes, ArrayBuffer.prototype);
  harden(copyBytes);
  genuineCopyBytes.add(copyBytes);
  return copyBytes;
};
harden(makeCopyBytes);

/**
 * TODO: This technique for recognizing genuine CopyBytes is incompatible
 * with our normal assumption of uncontrolled multiple instantiation of
 * a single module. However, our only alternative to this technique is
 * unprivileged re-validation of open data, which is incompat with our
 * need to encapsulate `arrayBuffer`, the genuinely mutable ArrayBuffer.
 *
 * @param {unknown} candidate
 * @param {import('./types.js').Checker} [check]
 * @returns {boolean}
 */
const canBeValid = (candidate, check = undefined) =>
  // @ts-expect-error `has` argument can actually be anything.
  genuineCopyBytes.has(candidate);

/**
 * @type {import('./internal-types.js').PassStyleHelper}
 */
export const CopyBytesHelper = harden({
  styleName: 'copyBytes',

  canBeValid,

  assertValid: (candidate, _passStyleOfRecur) => {
    canBeValid(candidate, assertChecker);
  },
});
