namespace scratchpad {
  // TypeScript has 5 main type categories:
  // 1. Primitive types, eg. string or number
  // 2. Literal types, eg. 'foo' or 42
  // 3. Data structure types, eg. arrays or objects
  // 4. Union types, eg. string | number
  // 5. Intersection types, eg. string & number

  // all primitive types:
  type Primitive =
    | string
    | number
    | boolean
    | symbol
    | bigint
    | null
    | undefined;

  // some literal types:
  type LiteralExample = "foo" | 42 | true;
  // It is worth noting that while in many languages the type of
  // a constant 42 is number or int, in TypeScript it is 42.

  type SomeFn = (x: number) => string;
  type SomeVariadicFn = (...args: number[]) => string;

  // some data structure types:
  type DataStructureExample =
    | string[] // arrays
    | [string, number] // tuples
    | { foo: string; bar: number } // objects
    | { [key: string]: number }; // records

  // ----------------------

  type Expect<T extends true> = T;
  type ExpectTrue<T extends true> = T;
  type ExpectFalse<T extends false> = T;
  type isTrue<T extends true> = T;
  type isFalse<T extends false> = T;

  type Not<T extends boolean> = T extends true ? false : true;

  type isAny<T> = 0 extends 1 & T ? true : false;
  // the above works because (1 & T) evaluates to any if T is any
  // else it evaluates to 1 or never.
  // 0 extends any evaluates to true, and 0 extends never or 0 extends 1
  // evaluates to false

  type isNotAny<T> = Not<isAny<T>>;

  type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
    T
  >() => T extends Y ? 1 : 2
    ? true
    : false;
  type NotEquals<X, Y> = Not<Equals<X, Y>>;

  type MergeInsertions<T> = T extends object
    ? { [K in keyof T]: MergeInsertions<T[K]> }
    : T;

  type Alike<X, Y> = Equals<MergeInsertions<X>, MergeInsertions<Y>>;

  type a = Equals<{ x: 1; y: 2 }, { x: 1 } & { y: 2 }>; // false
  type b = Alike<{ x: 1; y: 2 }, { x: 1 } & { y: 2 }>; // true

  // ----------------------
  // AoC day 6

  type Input = StringToArrayOfChars<"mjqjpqmgbljsphdztnvjfqwrcgsmlb">;

  type StringToArrayOfChars<
    S extends string,
    CurrArr extends any[] = []
  > = S extends `${infer Letter}${infer Rest}`
    ? StringToArrayOfChars<Rest, Append<CurrArr, Letter>>
    : CurrArr;

  // We want to check if a given array has duplicates, but how to do that?
  // Since we are in this kind of functional land, let's try to do it in Haskell first.

  // The naive, recursive solution would look something like this:
  // hasDuplicates :: [a] -> Bool
  // hasDuplicates [] = False
  // hasDuplicates (x:xs) = x `elem` xs || hasDuplicates xs

  // From that we can see that we have two cases to pattern match on and also we need
  // a helper function "elem".
  // Let's start with implementing "elem" first. Again, let's try to do it in Haskell first.

  // elem :: Eq a => a -> [a] -> Bool
  // elem _ [] = False
  // elem x (y:ys) = x == y || elem x ys

  // Again, two cases and we need Equals. Luckily we already have Equals implemented.

  type Elem<X, T extends any[]> = T extends [infer Y, ...infer Ys]
    ? Or<Equals<X, Y>, Elem<X, Ys>>
    : false;

  type And<A extends boolean, B extends boolean> = A extends true
    ? B extends true
      ? true
      : false
    : false;

  type Or<A extends boolean, B extends boolean> = Not<And<Not<A>, Not<B>>>;

  type HasDuplicates<T extends any[]> = T["length"] extends 0
    ? false
    : T extends [infer X, ...infer Xs]
    ? Or<Elem<X, Xs>, HasDuplicates<Xs>>
    : never;

  type Solution<Arr extends any[], Idx extends number = 4> = Arr extends [
    infer A,
    infer B,
    infer C,
    infer D,
    ...infer Rest
  ]
    ? Not<HasDuplicates<[A, B, C, D]>> extends true
      ? Idx
      : Solution<[B, C, D, ...Rest], Add<Idx, 1>>
    : never;

  // Whe need Add. In type programming in TS, we use array lengths to represent natural numbers.
  // So if we need to add 2 to 3, we need to create an array of length 2, array of length 3 and concat them and get their length type.
  // So again we need more aux functions for these ops.

  type Append<T extends any[], U> = [...T, U];
  type CreateArrOfLen<
    N extends number,
    CurrArr extends any[] = []
  > = CurrArr["length"] extends N
    ? CurrArr
    : CreateArrOfLen<N, Append<CurrArr, any>>;

  type Concat<A extends any[], B extends any[]> = [...A, ...B];

  type Length<T extends any[]> = T["length"] extends number
    ? T["length"]
    : never;

  type Add<N extends number, M extends number> = Length<
    Concat<CreateArrOfLen<N>, CreateArrOfLen<M>>
  >;

  type Sub<N extends number, M extends number> = CreateArrOfLen<N> extends [
    ...infer U,
    ...CreateArrOfLen<M>
  ]
    ? Length<U>
    : never;

  // solution cases

  type Answ = Solution<Input>;
  type solutionTests = [
    Expect<Equals<Solution<Input>, 7>>,
    Expect<
      Equals<Solution<StringToArrayOfChars<"bvwbjplbgvbhsrlpgdmjqwftvncz">>, 5>
    >,
    Expect<
      Equals<Solution<StringToArrayOfChars<"nppdvjthqldpwncqszvftbrmjlhg">>, 6>
    >,
    Expect<
      Equals<
        Solution<StringToArrayOfChars<"nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg">>,
        10
      >
    >,
    Expect<
      Equals<
        Solution<StringToArrayOfChars<"zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw">>,
        11
      >
    >
  ];

  // test cases ----------------------------
  type andCases = [
    Expect<Equals<And<true, true>, true>>,
    Expect<Equals<And<false, true>, false>>,
    Expect<Equals<And<true, false>, false>>,
    Expect<Equals<And<false, false>, false>>
  ];

  type orCases = [
    Expect<Equals<Or<true, true>, true>>,
    Expect<Equals<Or<false, true>, true>>,
    Expect<Equals<Or<true, false>, true>>,
    Expect<Equals<Or<false, false>, false>>
  ];

  type elemCases = [
    Expect<Equals<Elem<2, [1, 2, 3]>, true>>,
    Expect<Equals<Elem<3, [1, 2, 3]>, true>>,
    Expect<Equals<Elem<42, [1, 2, 3]>, false>>,
    Expect<Equals<Elem<0, [1, 2, 3]>, false>>
  ];

  type hasDuplicatesCases = [
    Expect<Equals<HasDuplicates<[1, 2, 3]>, false>>,
    Expect<Equals<HasDuplicates<[1, 2, 3, 4, 2]>, true>>,
    Expect<Equals<HasDuplicates<[123123, "wwaa", true, 22]>, false>>,
    Expect<Equals<HasDuplicates<[123123, "wwaa", true, 22, "wwaa"]>, true>>,
    Expect<Equals<HasDuplicates<[]>, false>>
  ];

  // let XXX: number = 50;
  // let yyy: 42 = 42;

  // yyy = XXX;

  namespace AAA {
    type x = { a: 1; b: 2 };
    type y = { b: 2; c: 3 };

    type inter = x & y;
    type a = keyof inter;

    type union = x | y;
    type b = keyof union;
  }

  namespace BBB {
    type x = "a" | "b" | "c";
    type y = "b" | "c" | "d";

    type inter = x & y;
    //   ^ "b" | "c"
    type union = x | y;
    //   ^ "a" | "b" | "c" | "d"
  }

  namespace aa {
    type User = { name: string; age: number; isAdmin: boolean };
    type PartialUser = Partial<User>;
    //  ^ { name?: string; age?: number; isAdmin?: boolean; }

    type RequiredUser = Required<PartialUser>;
    //   ^ { name: string; age: number; isAdmin: boolean; }

    type JustNameAndAge = Pick<User, "name" | "age">;
    //   ^ { name: string; age: number; }

    type WithoutName = Omit<User, "name">;
    //   ^ { age: number; isAdmin: boolean; }

    type ValueOf<T> = T[keyof T];

    type UserValue = ValueOf<User>;
  }

  namespace cool {
    type CoolArray = [4, 2, 0, ...number[]];
  }

  namespace pesel {
    type a = "abcd";
    type b<S extends string> = S extends `${infer A}${infer B}${infer Rest}`
      ? `${A}${B}`
      : never;

    type c = b<a>;

    type d = ToNumber<"990">;

    // ----------------------------
    // before
    type Person = {
      name: string;
      pesel: string;
      bornYear: number;
    };

    // type TypeSafePerson = {
    //   name: string;
    //   pesel: StringOfLength<11>;
    //   bornYear: number;
    // };

    type B<P extends Pesel> = P extends `${infer A}${infer B}${infer Rest}`
      ? {
          imie: string;
          pesel: P;
          rocznik: ToNumber<`${A}${B}`>;
        }
      : never;

    // createStudent("mieszko", "99123456789", 99); // OK

    //@ts-expect-error
    createStudent("mieszko", "99123456789", 90); // Err, classOf doesn't match pesel 🤯

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

    type Pesel = string;

    type DerivedClassOf<P extends Pesel> =
      P extends `${infer A}${infer B}${infer Rest}`
        ? ToNumber<`${A}${B}`>
        : never;
  }

  type ToNumber<
    T extends string,
    R extends any[] = []
  > = T extends `${R["length"]}` ? R["length"] : ToNumber<T, [1, ...R]>;
}
