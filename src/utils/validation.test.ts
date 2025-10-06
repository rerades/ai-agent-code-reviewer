import { describe, it, expect } from "vitest";
import * as E from "fp-ts/lib/Either.js";
import { validateFilename } from "./validation.js";

describe("validation", () => {
  it("validateFilename handles missing, non-string, empty and valid", () => {
    expect(validateFilename("")._tag).toBe("Left");
    expect(validateFilename("  ")._tag).toBe("Left");
    expect(validateFilename("/tmp/x.ts")).toEqual(E.right("/tmp/x.ts"));
  });
});


