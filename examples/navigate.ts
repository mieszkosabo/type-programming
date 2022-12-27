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

navigate("/blog/:postId", { postId: "aaa-bbb-ccc" }); // OK ✅

// @ts-expect-error
navigate("/blog/:postId", { someRandomKey: "aaa-bbb-ccc" }); // Err 🚨

navigate("/blog/:postId/comment/:commentId", {
  postId: "aaa-bbb-ccc",
  commentId: "c1",
}); // OK ✅
