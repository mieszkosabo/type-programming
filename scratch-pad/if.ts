type IsString<T> = T extends string ? true : false;

type If<Cond, IfBranch, ElseBranch> = Cond extends true ? IfBranch : ElseBranch;

type someType = "ala";

type Example = If<IsString<"ala">, string, number>; // string
