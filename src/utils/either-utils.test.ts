import { describe, it, expect } from "vitest";
import * as E from "fp-ts/lib/Either.js";
import { handleError, mapError, safeOperation, recoverWith, retry, toOption, fromOption, safeCompose } from "./either-utils.js";

describe("either-utils", () => {
  it("handleError returns fallback when Left", () => {
    const h = handleError((e: any) => `x:${e.type}`);
    expect(h(E.left({ type: "FileError", message: "m" } as any))).toBe("x:FileError");
  });

  it("safeOperation wraps thrown exceptions", () => {
    const op = safeOperation((n: number) => {
      if (n < 0) throw new Error("bad");
      return n + 1;
    });
    expect(op(1)).toEqual(E.right(2));
    expect(op(-1)._tag).toBe("Left");
  });

  it("recoverWith turns Left into Right(fallback)", () => {
    const r = recoverWith("f");
    expect(r(E.left({ type: "AIError", message: "m" } as any))).toEqual(E.right("f"));
  });

  it("toOption/fromOption convert correctly", () => {
    const some = toOption(E.right(1));
    expect(some._tag).toBe("Some");
    const back = fromOption(some as any, "err");
    expect(back).toEqual(E.right(1));
    const noneBack = fromOption({ _tag: "None" } as any, "err");
    expect(noneBack._tag).toBe("Left");
  });

  it("safeCompose stops on Left and returns Right when all pass", async () => {
    const ok = async (x: number) => E.right(x + 1);
    const bad = async (_: number) => E.left({ type: "NetworkError", message: "down" } as any);
    const flow1 = safeCompose(ok, ok);
    const flow2 = safeCompose(ok, bad, ok);
    expect(await flow1(0)).toEqual(E.right(2));
    expect((await flow2(0))._tag).toBe("Left");
  });

  it("retry resolves when an attempt succeeds", async () => {
    let n = 0;
    const op = async (x: number) => {
      n += 1;
      return n < 2 ? E.left({ type: "NetworkError", message: "" } as any) : E.right(x);
    };
    const run = retry(3)(op);
    const res = await run(5);
    expect(res).toEqual(E.right(5));
  });
});


