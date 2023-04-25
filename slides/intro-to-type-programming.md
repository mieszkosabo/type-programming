---
marp: true
paginate: true
---

<!-- class: invert -->
<!-- headingDivider: 2 -->

# Intro to type programming in TypeScript

<!-- _footer: Mieszko Sabo-->

<style>
 .container {
    display: flex;
 }

 .col {
    flex: 1;
 }
</style>

# Table of contents

- motivating example
- types refresher
- assignability from the perspective of the set theory
- how to program on the type level
- Live Coding: solving Advent of Code question TS type system

# Motivating example

```ts
navigate("/blog/:postId", { postId: "aaa-bbb-ccc" }); // OK ✅

// @ts-expect-error
navigate("/blog/:postId", { someRandomKey: "aaa-bbb-ccc" }); // Err 🚨

navigate("/blog/:postId/comment/:commentId", {
  postId: "aaa-bbb-ccc",
  commentId: "c1",
}); // OK ✅
```

# Motivating example continued

```ts
declare function navigate<U extends string>(
  path: U,
  params: ParseUrlParams<U>
): void;

type ParseUrlParams<url extends string> =
  url extends `${infer left}/${infer right}`
    ? ParseUrlParams<left> & ParseUrlParams<right>
    : url extends `:${infer param}`
    ? { [k in param]: string }
    : {};
```

# Types refresher

TypeScript has 5 main type categories:

1.  **Primitive types**, eg. string or number
2.  **Literal types**, eg. 'foo' or 42
3.  **Data structure types**, eg. arrays or objects
4.  **Union types**, eg. string | number
5.  **Intersection types**, eg. string & number

---

```ts
// all primitive types:
type Primitive = string | number | boolean | symbol | bigint | null | undefined;

// some literal types:
type LiteralExample = "foo" | 42 | true;

// some data structure types:
type DataStructureExample =
  | string[] // arrays
  | [string, number] // tuples
  | { foo: string; bar: number } // objects
  | { [key: string]: number }; // records

type SomeFn = (x: number) => string;
type SomeVariadicFn = (...args: number[]) => string;
```

---

```ts
// union
type U = A | B; // U is either A or B

// intersection
type I = A & B; // I is both A and B
```

- `|` and `&` **aren't operators**. Like tuples and objects, they are data structures.
- `A | B` doesn't create a new, unique (opaque) type, but rather puts them in a box, similarly to what `[A, B]` would do.

---

```ts
type x = "a" | "b" | "c";
type y = "b" | "c" | "d";

type inter = x & y;
//   ^ "b" | "c"
type union = x | y;
//   ^ "a" | "b" | "c" | "d"
```

---

Question for the audience

```ts
type x = { a: 1; b: 2 };
type y = { b: 2; c: 3 };

type inter = x & y;
type a = keyof inter;
//   ^ ???

type union = x | y;
type b = keyof union;
//   ^ ???
```

---

Answer

```ts
type x = { a: 1; b: 2 };
type y = { b: 2; c: 3 };

type inter = x & y;
type a = keyof inter;
//   "a" | "b" | "c"

type union = x | y;
type b = keyof union;
//   ^ "b"
```

# Assignability vs set theory

<!-- _footer: source: https://type-level-typescript.com/types-are-just-data-->

![height:450](https://type-level-typescript.com/_next/static/media/the-union-hierarchy.deb0c91f.svg)

---

**“A is assignable to B”** just means **“the set B includes all values within the set A”, or “A is a subset of B”.**

- compare with the previous slide.

---

- `unknown` is a type that contains all other types.
  - `A & unknown = A`
  - `A | unknown = unknown`
- `never` is the empty set.
  - `A & never = never`
  - `A | never = A`
- `any` is weird because it's the subset and the superset of every type.
  - `A & any = any`
  - `A | any = any`

# Useful type operators

# Objects

- reading properties

```ts
type User = { name: string; age: number; isAdmin: boolean };
type Name = User["name"];
//   ^ string
type NameOrAge = User["age" | "name"];
//   ^ string | number
type UserKeys = keyof User;
//   ^ "name" | "age" | "isAdmin"
type UserValues = User[UserKeys];
//   ^ string | number | boolean
type ValueOf<T> = T[keyof T];
type UserValue = ValueOf<User>;
//   ^ string | number | boolean
```

# Objects

- merging objects

```ts
type WithName = { name: string };
type WithAge = { age: number };
type WithIsAdmin = { isAdmin: boolean };

type User = WithName & WithAge & WithIsAdmin;
//   ^ { name: string; age: number; isAdmin: boolean; }
type Org = WithName & WithAge;
//   ^ { name: string; age: number; }
```

# Objects

- helper functions

```ts
type User = { name: string; age: number; isAdmin: boolean };
type PartialUser = Partial<User>;
//  ^ { name?: string; age?: number; isAdmin?: boolean; }

type RequiredUser = Required<PartialUser>;
//   ^ { name: string; age: number; isAdmin: boolean; }

type JustNameAndAge = Pick<User, "name" | "age">;
//   ^ { name: string; age: number; }

type WithoutName = Omit<User, "name">;
//   ^ { age: number; isAdmin: boolean; }
```

# Arrays and tuples

- reading elements

```ts
type SomeTuple = [string, number, boolean];
type First = SomeTuple[0]; // string
type Second = SomeTuple[1]; // number
type Tail = SomeTuple[1 | 2]; // number | boolean
type AllKeys = SomeTuple[number]; // string | number | boolean
// technically keyof SomeTuple also works but apart from indices it
// also includes `length`, `map`, `filter`, etc. So it is not practical.
```

# Arrays and tuples

- concatenating tuples

```ts
type SomeTuple = [1, 2, 3];
type AnotherTuple = [4, 5, 6];
type Concatenated = [...SomeTuple, ...AnotherTuple];
//   ^ [1, 2, 3, 4, 5, 6]
```

# Arrays and tuples

- Arrays

```ts
type Names = string[];
type AlsoNames = Array<string>;

type Bits = (0 | 1)[];
type AlsoBits = Array<0 | 1>;
```

# Arrays and tuples

- Mixing arrays and tuples

```ts
type CoolArray = [4, 2, 0, ...number[]]; // array starts with 4, 2, 0
type NonEmpty<T> = [T, ...T[]]; // array of at least one element
type Padded = [0, ...number[], 0];
```

# Programming on the type level

## What do we need to program?

<div class="container">
<div class="col">
  <div>
    <li> conditionals / code branching </li>
    <li> loops </li>
    <li> data structures </li>
    <li> functions </li>
    <li> basic algebra </li>
  </div>
</div>

## What do we need to program?

<div class="container">
<div class="col">
  <div>
    <li> conditionals / code branching </li>
    <li> loops </li>
    <li> data structures </li>
    <li> functions </li>
    <li> basic algebra </li>
  </div>
</div>

<div class="col">
  <div>
    <li> conditional types </li>
    <li> recursion </li>
    <li> type level data structures </li>
    <li> generic types </li>
    <li> cheeky usage or tuples' lengths</li>
  </div>
</div>
</div>

# Generic types as functions

```ts
// value-level TypeScript
const makeTuple = (a, b) => [a, b];

// type-level TypeScript
type MakeTuple<T, U> = [T, U];
```

# Generic types as functions

```ts
// value-level TypeScript
const makeTuple = (a, b) => [a, b];
//                ^ function arguments
//                          ^ return value

// type-level TypeScript
type MakeTuple<T, U> = [T, U];
//             ^ type arguments/parameters
//                     ^ return type
```

# Generic types as functions

```ts
// value-level TypeScript
const makeTuple = (a: number, b: string) => [a, b];

// type-level TypeScript
type MakeTuple<T extends number, U extends string> = [T, U];
```

# Conditional types

```ts
type IsString<T> = T extends string ? true : false;
```

# Conditional types

```ts
type IsString<T> = T extends string ? true : false;
//                ^ condition, must be ^ true branch
//                in a form of a             ^ false branch
//                `X extends Y`
```

# Conditional types

```ts
type If<Cond extends boolean, IfBranch, ElseBranch> = Cond extends true
  ? IfBranch
  : ElseBranch;

type Example = If<IsString<"ala">, string, number>; // string
```

# Recursion

- Recursion is how loops can be emulated in functional languages.
- In general, a recursive function is a function that calls itself (usually with different arguments).

```ts
type RecursiveType<Input> = Condition<Input> extends true
  ? BaseCase<Input>
  : RecursiveType<OtherInput>;

// example on value level:

const fib = (n: number): number => {
  if (n <= 1) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
};
```

# Recursion

```ts
type Elem<X, T extends any[]> = T extends [infer Y, ...infer Ys]
  ? Or<Equals<X, Y>, Elem<X, Ys>>
  : false;
```

# Operations on natural numbers

- In type programming in TS, we use array lengths to represent natural numbers.
- So if we need to add 2 to 3, we need to create an array of length 2, array of length 3, concatenate them and get their length type.

# Operations on natural numbers

```ts
type Append<T extends any[], U> = [...T, U];

type appendExample = Append<[1, 2], 3>; // [1, 2, 3]

type CreateArrOfLen<
  N extends number,
  CurrArr extends any[] = []
> = CurrArr["length"] extends N
  ? CurrArr
  : CreateArrOfLen<N, Append<CurrArr, any>>;

type createArrOfLenExample = CreateArrOfLen<3>; // [any, any, any]
```

# Operations on natural numbers

```ts
type Concat<A extends any[], B extends any[]> = [...A, ...B];

type Length<T extends any[]> = T["length"] extends number ? T["length"] : never;

type Add<N extends number, M extends number> = Length<
  Concat<CreateArrOfLen<N>, CreateArrOfLen<M>>
>;

type test1 = Add<1, 2>; // 3
type test2 = Add<42, 58>; // 100

type test3 = Add<0, 0>; // 0
type test4 = Add<-1, 1>; // Error, recursion too deep (infinite loop)
```

# Operations on natural numbers

```ts
type Sub<N extends number, M extends number> = CreateArrOfLen<N> extends [
  ...infer U,
  ...CreateArrOfLen<M>
]
  ? Length<U>
  : never;
```

# Repository with slides and code examples

https://github.com/mieszkosabo/type-programming

# Live Coding!

# Advent of Code day 6

`../assets/aoc-day6.md`
