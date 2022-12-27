// interpreter for a simple language implemented on type level TypeScript
// the language could look something like this:

// a = 4
// b = 5
// c = a + b
// return c

import { Add, Sub } from "./natural_numbers";

type Env = Array<{ varname: string; value: number }>;

type Expr =
  | { _type: "literal"; value: number }
  | { _type: "var"; name: string }
  | { _type: "add"; lhs: Expr; rhs: Expr }
  | { _type: "sub"; lhs: Expr; rhs: Expr };

type Stmt =
  | { _type: "assign"; lhs: string; rhs: Expr }
  | { _type: "return"; value: Expr };

type Program = Array<Stmt>;

type DefaultTo<T, Default extends number> = T extends number ? T : Default;

// Expr -> Env -> value
type Eval<expr, env> = expr extends {
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
type ExecuteStmt<stmt, env> = stmt extends {
  _type: "assign";
  lhs: infer lhs;
  rhs: infer rhs;
}
  ? [UpdateEnv<lhs, Eval<rhs, env>, env>, null]
  : stmt extends { _type: "return"; value: infer value }
  ? [env, Eval<value, env>]
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

type program = [
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

type retVal = RunProgram<program>;
