export type Not<T extends boolean> = T extends true ? false : true;

export type And<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;

export type Or<A extends boolean, B extends boolean> = Not<And<Not<A>, Not<B>>>;
