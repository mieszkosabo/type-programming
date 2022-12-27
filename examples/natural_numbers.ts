import type { Equals, ExpectTrue } from "./testing_utils";

export type Append<T extends any[], U> = [...T, U];
type AppendTests = [
  ExpectTrue<Equals<Append<[1, 2, 3], 4>, [1, 2, 3, 4]>>,
  ExpectTrue<Equals<Append<[any, any, any], any>, [any, any, any, any]>>
];

export type CreateArrOfLen<
  N extends number,
  CurrArr extends any[] = []
> = CurrArr["length"] extends N
  ? CurrArr
  : CreateArrOfLen<N, Append<CurrArr, any>>;

type CreateArrOfLenTests = [
  ExpectTrue<Equals<CreateArrOfLen<0>, []>>,
  ExpectTrue<Equals<CreateArrOfLen<1>, [any]>>,
  ExpectTrue<Equals<CreateArrOfLen<4>, [any, any, any, any]>>
];

export type Concat<A extends any[], B extends any[]> = [...A, ...B];

type ConcatTests = [
  ExpectTrue<Equals<Concat<[1, 2], [3, 4]>, [1, 2, 3, 4]>>,
  ExpectTrue<Equals<Concat<[1, 2], []>, [1, 2]>>,
  ExpectTrue<Equals<Concat<[], [3, 4]>, [3, 4]>>
];

export type Length<T extends any[]> = T["length"] extends number
  ? T["length"]
  : never;

type LengthTests = [
  ExpectTrue<Equals<Length<[]>, 0>>,
  ExpectTrue<Equals<Length<[any]>, 1>>,
  ExpectTrue<Equals<Length<[1, 2, 3, 4]>, 4>>
];

export type Add<N extends number, M extends number> = Length<
  Concat<CreateArrOfLen<N>, CreateArrOfLen<M>>
>;

type AddTests = [
  ExpectTrue<Equals<Add<1, 1>, 2>>,
  ExpectTrue<Equals<Add<0, 1>, 1>>,
  ExpectTrue<Equals<Add<0, 1>, 1>>,
  ExpectTrue<Equals<Add<42, 58>, 100>>
];

export type Sub<
  N extends number,
  M extends number
> = CreateArrOfLen<N> extends [...infer U, ...CreateArrOfLen<M>]
  ? Length<U>
  : never;

type SubTests = [
  ExpectTrue<Equals<Sub<1, 1>, 0>>,
  ExpectTrue<Equals<Sub<1, 0>, 1>>,
  ExpectTrue<Equals<Sub<42, 2>, 40>>,
  ExpectTrue<Equals<Sub<100, 42>, 58>>
];

type MultiplyElems<T extends any[], N extends number> = T extends [
  infer H,
  ...infer R
]
  ? [...CreateArrOfLen<N>, ...MultiplyElems<R, N>]
  : [];

export type Mul<N extends number, M extends number> = Length<
  MultiplyElems<CreateArrOfLen<N>, M>
>;

type MulTests = [
  ExpectTrue<Equals<Mul<1, 1>, 1>>,
  ExpectTrue<Equals<Mul<1, 0>, 0>>,
  ExpectTrue<Equals<Mul<0, 1>, 0>>,
  ExpectTrue<Equals<Mul<0, 0>, 0>>,
  ExpectTrue<Equals<Mul<2, 2>, 4>>,
  ExpectTrue<Equals<Mul<4, 12>, 48>>
];
