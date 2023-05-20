# Passables: `kindOf`  *vs* `passStyleOf` levels of abstraction

We have three very distinct abstraction levels in our system in which to describe the passable data types and the operations on them. On the left is the higher ***`kindOf`*** level, containing the passable data types and operations of concern to the normal application programmer. A document intended for those application programmers would explain the `kindOf` level in a self contained manner. This is not that document.

In the middle is the lower ***`passStyleOf`*** level of abstraction, which defines the [core data model of the language-independent OCapN protocol]((https://github.com/ocapn/ocapn/issues/5#issuecomment-1549012122)). The `passStyleOf` level provides the data types and operations used to implement the `kindOf` level, but without being specific to the `kindOf` level. The OCapN core data types, the `passStyleOf` level, and the `@endo/pass-style` and `@endo/marshal` packages can support independent co-existing higher layers like this `kindOf` level.

On the right is the *JavaScript* level, explaining how these map onto JavaScript language. This mapping determines how JavaScript values round trip or not through the protocol. Only hardened JavaScript values can be passable. The mapping of protocol concepts to JavaScript should serve as an example of how to map the protocol onto the concepts of other languages.

|                | `kindOf` level                   | `passStyleOf` level | JavaScript level                                      |
| -------------- | -------------------------------- | ------------------- | ----------------------------------------------------- |
| Classification | `kindOf(p)`<br>`M.key()`<br>`M.pattern()` | `passStyleOf(p)` | `typeof j`                                      |
| Equivalence    | `sameKey(k,k)`                   |                     | `j === j`<br>`Object.is(j,j)`<br>`sameValueZero(j,j)` |
| Ordering       | `compareKeys(k,k)`<br>`M.gte(k)` | `compareRank(p,p)`  | `j <= j`<br>`[...js].sort(compare(j,j))`              |

Where the parameter
   * `j` is for any JavaScript value.
   * `p` is for any `Passable`, a subset of JavaScript values.
   * `k` is for any `Key`, a subset of passables.


## OCapN *vs* Endo `passStyleOf` *vs* JavaScript `typeof`

The OCapN language-independent ocap protocol is in flux. As of May 20 2023, the best draft of the OCapN data model is [the thread starting here](https://github.com/ocapn/ocapn/issues/5#issuecomment-1549012122). Although the Endo `passStyleOf` names differ, the taxonomy and data models will be the same. The `@endo/pass-style` package defines the language binding of this abstract data model to JavaScript language values, which are therefore considered *passable values*.

|            | OCapN name    | `passStyleOf`      | `typeof`      | JS notes         |
|------------|---------------|--------------------|---------------|------------------|
| Atoms      |               |                    |               |                  |
|            | Null          | `null`             | `object`      | null             |
|            | Undefined     | `undefined`        | `undefined`   |                  |
|            | Boolean       | `boolean`          | `boolean`     |                  |
|            | Float64       | `number`           | `number`      | Only one `0.0`, Only one `NaN` |
|            | SignedInteger | `bigint`           | `bigint`      |                  |
|            | Symbol        | `symbol`           | `symbol`      | well-known & registered only (names TBD) |
|            | String        | `string`           | `string`      | surrogate confusion (TBD) |
|            | ByteString    | `byteString` (TBD) | `object`      | UInt8Array (TBD) |
| Containers |               |                    |               |                  |
|            | Sequence      | `copyArray`        | `object`      | Array            |
|            | Struct        | `copyRecord`       | `object`      | POJO             |
|            | Tagged        | `tagged`           | `object`      | Tagged           |
| Capability |               |                    |               |                  |
|            |               | `remotable`        | `function`    | Far function     |
|            |               | `remotable`        | `object`      | Far object with methods |
|            |               | `remotable`        | `object`      | Remote presence  |
|            |               | `promise`          | `object`      | Promise          |
| Others     |               |                    |               |                  |
|            | Error         | `error`            | `object`      | Error            |

The `@endo/marshal` package defines encodings of the data model for purposes of serialization and transmission over such protocols. The `@endo/marshal` package also defines a rank-ordering over all passable values, where a "rank-order" is a full-order with ties. Tied values are said to be of the *same rank*. A rank-order can be used for sorting. This rank-oder itself is not intended to make sense to the application programmer.

The `@endo/patterns` package defines the `kindOf` taxonomy, which includes additional containers, Keys and Patterns, and a `compareKeys` partial-order over keys that is designed to be meaningful and useful to the applications programmer.

## `kindOf` *vs* `passStyleOf`

For every passable value except Tagged, `kindOf(p) === passStyleOf(p)`. They differ only when `passStyleOf(p) === 'tagged'`. For those, either the `kindOf` level recognizes the Tagged as encoding one of the higher level types defined by the `kindOf` level, or it does not. If it does not, then `kindOf(p) === undefined`. Only the `passStyleOf` level is assumed for universal interoperability. Different participants may encode and recognize different extensions using the same Tagged extension point. If a participant that does not recognize a particular Tagged according to a higher layer it uses, it must still treat it as a valid Tagged object, which must still round trip. Alice might send a Tagged she recognizes to Bob, who does not, but who sends it on to Carol who does.

When the `kindOf` level does recognize a Tagged value, `kindOf(p)` returns the actual tagged string. To be so recognized, a Tagged value must not only carry such a recognized tag string. In addition, its payload must be recognized to satisfy all the invariants that the `kindOf` level associates with that tag string. In these cases, the tag string does represent the kind.

|              | `kindOf(p)`  | `passStyleOf(p)` | meaning                        |
|--------------|--------------|------------------|--------------------------------|
| Atoms        |              |                  |                                |
|              | ...          | ...              | primitive data                 |
| Containers   |              |                  |                                |
|              | `copyArray`  | `copyArray`      | sequence of passable values    |
|              | `copyRecord` | `copyRecord`     | set of name,passable pairs     |
|              | `copySet`    | `tagged`         | Set of unique keys             |
|              | `copyBag`    | `tagged`         | Multiset of key,count pairs    |
|              | `copyMap`    | `tagged`         | Map from keys to passables     |
| Matchers     | `match:*`    | `tagged`         | Non-literal patterns           |
| Guards (TBD) | `guard:*`    | `tagged`         | Non-pattern guards             |
| Just Tagged  | undefined    | `tagged`         | Not understood to have a kind  |
| Capability   |              |                  |                                |
|              | `remotable`  | `remotable`      | behavior + identity            |
|              | `promise`    | `promise`        | Promise                        |
| Other        |              |                  |                                |
|              | `error`      | `error`          | best efforts loose diagnostics |


## Data, Keys, and Patterns

At the `passStyleOf` level, the containers are CopyArray, CopyRecord, and Tagged. Any passable value is a possibly-empty tree of containers ending in non-container leaves. If the container tree is empty, then the passable value is some non-container value as the leaf of the empty tree. If the leaves do not contain Capabilities, i.e., Remotables or Promises, then the Passable value is Data. It carries only immutable information, without either connection to anything external, nor any unforgeable identity.

Guards do not yet exist as distinct kinds, so we ignore them for now. TODO: Expand this if kinds expand to include guards.

At the `kindOf` level, the containers are CopyArray, CopyRecord, CopySet, CopyBag, and CopyMap. At this level, Matchers, possibly Guards, and unrecognized Taggeds are not considered containers. Again, Any passable value is a possibly-empty tree of containers ending in non-container leaves. The containers at the `passStyleOf` level, CopyArray, CopyRecord, and Tagged, do not need any comparability among their elements.

By contrast, the elements of CopySets and CopyBags, as well as the keys of CopyMaps must be comparable for equality. This subset of passable values are the Keys. Because these containers are pass-by-copy, this equality must be pass-invariant: If passing xa from vatA to vatB arrives as xb, and likewise ya and yb, then `sameKey(xa,ya)` iff `sameKey(xb,yb)`. We do not wish to give Promises, Errors, or unrecognized Taggeds any useful pass-invariant equality. Thus, the leaves of a Key's kind-containment tree may not include Promises, Errors, or unrecognized Taggeds.

These conditions all apply to Patterns as well. The differences are
   * Patterns can contain Matchers, but Keys cannot. Thus, all Keys are Patterns, but Patterns that include Matchers are not Keys.
   * Non-Keys, including non-Key Patterns, cannot be elements of sets of bags, or keys of maps.

A Pattern is a pass-invariant passable decidable synchronous predicate over Passables. A Key used as a Pattern matches only exactly itself, according to the pass-invariant `sameKey` distributed equality semantics. Because Patterns must be pass-invariant, passable between mutually suspicious parties, and usable for synchronous testing of Passables, they cannot be user-extensible by code predicates. In several ways including this one, Patterns feel much like conventional types.

Since CopySets and CopyBags can only contain Keys, they also necessarily are Keys. Maps can contain non-Key values. But a Map that contains only Key values is also a Key. Sets, bags, and maps able to be keys or sets, bags, or maps. But this containment tree must remain a finite tree, without cycles.
