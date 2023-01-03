// An Interpreter for a simple language implemented on type level TypeScript.
// The language supports:
// - variables
// - while loops
// - if statements
// - natural numbers
// - boolean logic: and, or, not
// TODO: <, >, <=, >= operators

import { And, Not, Or } from "./logic";
import { Add, Sub } from "./natural_numbers";
import { Equals, ExpectTrue, NotEquals } from "./testing_utils";

/// INTERPRETER TYPES ----------------------------------------------------------
type Env = Array<{ varname: string; value: number }>;

type Expr =
  | { _type: "numLiteral"; value: number }
  | { _type: "boolLiteral"; value: boolean }
  | { _type: "and"; lhs: Expr; rhs: Expr }
  | { _type: "or"; lhs: Expr; rhs: Expr }
  | { _type: "not"; value: Expr }
  | { _type: "eq"; lhs: Expr; rhs: Expr }
  | { _type: "neq"; lhs: Expr; rhs: Expr }
  | { _type: "var"; name: string }
  | { _type: "add"; lhs: Expr; rhs: Expr }
  | { _type: "sub"; lhs: Expr; rhs: Expr };

type Stmt =
  | { _type: "assign"; lhs: string; rhs: Expr }
  | { _type: "return"; value: Expr }
  | { _type: "while"; cond: Expr; body: Array<Stmt> }
  | { _type: "if"; cond: Expr; body: Array<Stmt> };

type Program = Array<Stmt>;

/// UTILS ----------------------------------------------------------------------
type DefaultTo<T, Default extends number> = T extends number ? T : Default;

/// INTERPRETER ----------------------------------------------------------------

// Expr -> Env -> value
type Eval<expr, env> =
  // num literal
  expr extends {
    _type: "numLiteral";
    value: infer V;
  }
    ? V
    : // bool literal
    expr extends { _type: "boolLiteral"; value: infer V }
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
    : // neq
    expr extends { _type: "neq"; lhs: infer lhs; rhs: infer rhs }
    ? NotEquals<Eval<lhs, env>, Eval<rhs, env>>
    : // eq
    expr extends { _type: "eq"; lhs: infer lhs; rhs: infer rhs }
    ? Equals<Eval<lhs, env>, Eval<rhs, env>>
    : // and
    expr extends { _type: "and"; lhs: infer lhs; rhs: infer rhs }
    ? And<
        Eval<lhs, env> extends boolean ? Eval<lhs, env> : never,
        Eval<rhs, env> extends boolean ? Eval<rhs, env> : never
      >
    : // or
    expr extends { _type: "or"; lhs: infer lhs; rhs: infer rhs }
    ? Or<
        Eval<lhs, env> extends boolean ? Eval<lhs, env> : never,
        Eval<rhs, env> extends boolean ? Eval<rhs, env> : never
      >
    : // not
    expr extends { _type: "or"; value: infer value }
    ? Not<Eval<value, env> extends boolean ? Eval<value, env> : never>
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
    ? Eval<cond, env> extends false
      ? [env, null]
      : ExecuteStmts<body, env> extends [infer newEnv, infer value]
      ? value extends null
        ? ExecuteStmt<stmt, newEnv>
        : [newEnv, value]
      : never
    : // if
    stmt extends { _type: "if"; cond: infer cond; body: infer body }
    ? Eval<cond, env> extends false
      ? [env, null]
      : ExecuteStmts<body, env> extends [infer newEnv, infer value]
      ? value extends null
        ? [newEnv, null]
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

/// EXAMPLE PROGRAMS -----------------------------------------------------------
type simpleProgram = [
  // x = 42
  { _type: "assign"; lhs: "x"; rhs: { _type: "numLiteral"; value: 42 } },

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

type test1 = ExpectTrue<Equals<RunProgram<simpleProgram>, 84>>;

type sumOfNumbersFrom1To10 = [
  // n = 10
  { _type: "assign"; lhs: "n"; rhs: { _type: "numLiteral"; value: 10 } },

  // sum = 0
  { _type: "assign"; lhs: "sum"; rhs: { _type: "numLiteral"; value: 0 } },

  // while n != 0:
  //    sum = sum + n
  //    n = n - 1
  {
    _type: "while";
    cond: {
      _type: "neq";
      lhs: { _type: "var"; name: "n" };
      rhs: { _type: "numLiteral"; value: 0 };
    };
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
          rhs: { _type: "numLiteral"; value: 1 };
        };
      }
    ];
  },

  // return sum
  { _type: "return"; value: { _type: "var"; name: "sum" } }
];

type test2 = ExpectTrue<Equals<RunProgram<sumOfNumbersFrom1To10>, 55>>;

type conditionals = [
  // x = 42
  { _type: "assign"; lhs: "x"; rhs: { _type: "numLiteral"; value: 42 } },
  // if x == 43 or 5 == 5:
  // return 1
  {
    _type: "if";
    cond: {
      _type: "or";
      lhs: {
        _type: "eq";
        lhs: { _type: "var"; name: "x" };
        rhs: { _type: "numLiteral"; value: 43 };
      };
      rhs: {
        _type: "eq";
        lhs: { _type: "numLiteral"; value: 5 };
        rhs: { _type: "numLiteral"; value: 5 };
      };
    };
    body: [{ _type: "return"; value: { _type: "numLiteral"; value: 1 } }];
  },
  // return 0
  { _type: "return"; value: { _type: "numLiteral"; value: 0 } }
];

type test3 = ExpectTrue<Equals<RunProgram<conditionals>, 1>>;
