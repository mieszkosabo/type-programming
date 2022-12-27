// An Interpreter for a simple language implemented on type level TypeScript.
// The language supports:
// - variables
// - while loops

import { Add, Sub } from "./natural_numbers";

type Env = Array<{ varname: string; value: number }>;

type Expr =
  | { _type: "literal"; value: number }
  | { _type: "var"; name: string }
  | { _type: "add"; lhs: Expr; rhs: Expr }
  | { _type: "sub"; lhs: Expr; rhs: Expr };

type Stmt =
  | { _type: "assign"; lhs: string; rhs: Expr }
  | { _type: "return"; value: Expr }
  | { _type: "while"; cond: Expr; body: Array<Stmt> };

type Program = Array<Stmt>;

type DefaultTo<T, Default extends number> = T extends number ? T : Default;

// Expr -> Env -> value
type Eval<expr, env> =
  // literal
  expr extends {
    _type: "literal";
    value: infer V;
  }
    ? V
    : // var
    expr extends { _type: "var"; name: infer varname }
    ? Lookup<varname, env>
    : // add
    expr extends { _type: "add"; lhs: infer lhs; rhs: infer rhs }
    ? Add<DefaultTo<Eval<lhs, env>, 0>, DefaultTo<Eval<rhs, env>, 0>>
    : // sub
    expr extends { _type: "sub"; lhs: infer lhs; rhs: infer rhs }
    ? Sub<DefaultTo<Eval<lhs, env>, 0>, DefaultTo<Eval<rhs, env>, 0>>
    : never;

// varname -> Env -> value
type Lookup<varname, env> = env extends [infer head, ...infer tail]
  ? head extends { varname: varname; value: infer V }
    ? V
    : Lookup<varname, tail>
  : never;

type a = Eval<{ _type: "literal"; value: 42 }, []>;
type b = Eval<
  { _type: "var"; name: "y" },
  [{ varname: "x"; value: 42 }, { varname: "y"; value: 43 }]
>;

type UpdateEnv<varname, value, env> = env extends [infer head, ...infer tail]
  ? head extends { varname: varname }
    ? [{ varname: varname; value: value }, ...tail]
    : [head, ...UpdateEnv<varname, value, tail>]
  : [{ varname: varname; value: value }];

// Stmt -> Env -> (Env, maybe value)
type ExecuteStmt<stmt, env> =
  // assign
  stmt extends {
    _type: "assign";
    lhs: infer lhs;
    rhs: infer rhs;
  }
    ? [UpdateEnv<lhs, Eval<rhs, env>, env>, null]
    : // return
    stmt extends { _type: "return"; value: infer value }
    ? [env, Eval<value, env>]
    : // while
    stmt extends { _type: "while"; cond: infer cond; body: infer body }
    ? Eval<cond, env> extends 0
      ? [env, null]
      : ExecuteStmts<body, env> extends [infer newEnv, infer value]
      ? value extends null
        ? ExecuteStmt<stmt, newEnv>
        : [newEnv, value]
      : never
    : never;

// [Stmt] -> Env -> (Env, maybe value)
type ExecuteStmts<stmts, currentEnv = []> = stmts extends [infer h, ...infer t]
  ? ExecuteStmt<h, currentEnv> extends [infer newEnv, infer value]
    ? value extends null
      ? ExecuteStmts<t, newEnv>
      : [newEnv, value]
    : never
  : [currentEnv, null];

// program -> maybe value
type RunProgram<program extends Program> = ExecuteStmts<program> extends [
  any,
  infer value
]
  ? value
  : never;

type simpleProgram = [
  // x = 42
  { _type: "assign"; lhs: "x"; rhs: { _type: "literal"; value: 42 } },

  // y = x
  { _type: "assign"; lhs: "y"; rhs: { _type: "var"; name: "x" } },

  // z = x + y
  {
    _type: "assign";
    lhs: "z";
    rhs: {
      _type: "add";
      lhs: { _type: "var"; name: "x" };
      rhs: { _type: "var"; name: "y" };
    };
  },

  // return z
  { _type: "return"; value: { _type: "var"; name: "z" } }
];

type retVal = RunProgram<simpleProgram>;

type sumOfNumbersFrom1To10 = [
  // n = 10
  { _type: "assign"; lhs: "n"; rhs: { _type: "literal"; value: 10 } },

  // sum = 0
  { _type: "assign"; lhs: "sum"; rhs: { _type: "literal"; value: 0 } },

  // while n != 0:
  //    sum = sum + n
  //    n = n - 1
  {
    _type: "while";
    cond: { _type: "var"; name: "n" };
    body: [
      {
        _type: "assign";
        lhs: "sum";
        rhs: {
          _type: "add";
          lhs: { _type: "var"; name: "sum" };
          rhs: { _type: "var"; name: "n" };
        };
      },
      {
        _type: "assign";
        lhs: "n";
        rhs: {
          _type: "sub";
          lhs: { _type: "var"; name: "n" };
          rhs: { _type: "literal"; value: 1 };
        };
      }
    ];
  },

  // return sum
  { _type: "return"; value: { _type: "var"; name: "sum" } }
];

type sum = RunProgram<sumOfNumbersFrom1To10>;
