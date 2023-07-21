// @ts-nocheck
import makeE from './E.js';

const hp = HandledPromise;
export const E = makeE(HandledPromise);
export { hp as HandledPromise };

// eslint-disable-next-line import/export
export * from './exports.js';
