---
marp: true
paginate: true
---

<!-- class: invert -->
<!-- headingDivider: 2 -->

# Intro to type programming in TypeScript

<!-- _footer: Mieszko Sabo-->

# Table of contents

- motivating example
- types refresher
- assignability from the perspective of the set theory
- how to program on the type level
- Live Coding: solving Advent of Code question TS type system

# Motivating example

```ts
createStudent("mieszko", "99123456789", 99); // OK
createStudent("mieszko", "99123456789", 90); // 🚨 Err, classOf doesn't match pesel 🤯

function createStudent<T extends string>(
  name: string,
  pesel: T,
  classOf: DerivedClassOf<T>
) {
  return {
    name,
    pesel,
    classOf,
  };
}
```

---

```ts
type Pesel = string;

type DerivedClassOf<P extends Pesel> =
  P extends `${infer A}${infer B}${infer Rest}` ? ToNumber<`${A}${B}`> : never;

type ToNumber<
  T extends string,
  R extends any[] = []
> = T extends `${R["length"]}` ? R["length"] : ToNumber<T, [1, ...R]>;
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

# Programming on the type level

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

# Live Coding!
