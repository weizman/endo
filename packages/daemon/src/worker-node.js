/* global process */

// Establish a perimeter:
import 'ses';
import '@endo/eventual-send/shim.js';
import '@endo/promise-kit/shim.js';
import '@endo/lockdown/commit.js';

import fs from 'fs';

import { makePromiseKit } from '@endo/promise-kit';
import { main } from './worker.js';
import { makePowers } from './worker-node-powers.js';

if (process.argv.length < 7) {
  throw new Error(
    `worker.js requires arguments workerUuid, daemonSockPath, workerStatePath, workerEphemeralStatePath, workerCachePath, got ${process.argv.join(
      ', ',
    )}`,
  );
}

const [workerUuid, sockPath, statePath, ephemeralStatePath, cachePath] =
  process.argv.slice(2);

/** @type {import('../index.js').Locator} */
const locator = {
  sockPath,
  statePath,
  ephemeralStatePath,
  cachePath,
};

const powers = makePowers({ fs });

const { promise: cancelled, reject: cancel } =
  /** @type {import('@endo/promise-kit').PromiseKit<never>} */ (
    makePromiseKit()
  );

process.once('SIGINT', () => cancel(new Error('SIGINT')));

main(powers, locator, workerUuid, process.pid, cancel, cancelled).catch(
  powers.exitOnError,
);
