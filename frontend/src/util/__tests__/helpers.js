import { formatLongNumbers } from "../helpers";

describe("Helper functions", function () {
  it("should abbreviate large numbers by appending quantifier chars", function () {
    expect(formatLongNumbers("2000000000000")).toBe("2T");
    expect(formatLongNumbers("200000000000")).toBe("200B");
    expect(formatLongNumbers("2000000000")).toBe("2B");
    expect(formatLongNumbers("200000000")).toBe("200M");
    expect(formatLongNumbers("2000000")).toBe("2M");
    expect(formatLongNumbers("200000")).toBe("200K");
    expect(formatLongNumbers("2000")).toBe("2K");
    expect(formatLongNumbers("200")).toBe("200");
    expect(formatLongNumbers("200.12")).toBe("200.1");
  });

  it("should return a single dash for values which are effectively zero", function () {
    expect(formatLongNumbers(null)).toBe("-");
    expect(formatLongNumbers(0)).toBe("-");
    expect(formatLongNumbers("0")).toBe("-");
    expect(formatLongNumbers("")).toBe("-");
  });
});
