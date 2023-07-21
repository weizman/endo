import type { HandledPromiseConstructor } from './types.d';

// Package Types /////////////////////////////////////////////////////
//
//   Types exported to consumers.
//

export type {
  RemotableBrand,
  DataOnly,
  FarRef,
  ERef,
  EProxy,
  EOnly,
  RemoteFunctions,
  LocalRecord,
  FilteredKeys,
  PickCallable,
  EPromiseKit as RemoteKit,
  ResolveWithPresenceOptionsBag,
  HandledExecutor,
  Settler,
  HandledPromiseStaticMethods,
  HandledPromiseConstructor,
  Handler as EHandler,
} from './types.d';

declare namespace global {
  // eslint-disable-next-line vars-on-top,no-var
  var HandledPromise: HandledPromiseConstructor;
}
