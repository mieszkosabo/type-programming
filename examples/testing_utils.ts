export type Expect<T extends true> = T;
export type ExpectTrue<T extends true> = T;
export type ExpectFalse<T extends false> = T;
export type isTrue<T extends true> = T;
export type isFalse<T extends false> = T;

export type isAny<T> = 0 extends 1 & T ? true : false;
// the above works because (1 & T) evaluates to any if T is any
// else it evaluates to 1 or never.
// 0 extends any evaluates to true, and 0 extends never or 0 extends 1
// evaluates to false

export type isNotAny<T> = isAny<T> extends true ? false : true;

export type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;
export type NotEquals<X, Y> = Equals<X, Y> extends true ? false : true;

export type MergeInsertions<T> = T extends object
  ? { [K in keyof T]: MergeInsertions<T[K]> }
  : T;

export type Alike<X, Y> = Equals<MergeInsertions<X>, MergeInsertions<Y>>;
