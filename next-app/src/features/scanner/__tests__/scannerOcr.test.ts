import { describe, expect, it } from "vitest";
import { parseScannerOcrText } from "../scannerOcr";

describe("scanner OCR parsing", () => {
  it("extracts passport MRZ suggestions", () => {
    const suggestion = parseScannerOcrText([
      "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      "L898902C36UTO7408122F3204159ZE184226B<<<<<10",
    ].join("\n"));

    expect(suggestion.source).toBe("mrz");
    expect(suggestion.input.type).toBe("passport");
    expect(suggestion.input.number).toBe("L898902C3");
    expect(suggestion.input.authority).toBe("UTO");
    expect(suggestion.input.expiryDate).toBe("2032-04-15");
    expect(suggestion.confidence).toBeGreaterThan(0.9);
  });

  it("extracts CDC numbers and expiry dates", () => {
    const suggestion = parseScannerOcrText("CDC No: IND-445566 issued by Directorate General of Shipping expiry date 12/08/2030");

    expect(suggestion.source).toBe("cdc");
    expect(suggestion.input.type).toBe("cdc");
    expect(suggestion.input.number).toBe("IND-445566");
    expect(suggestion.input.expiryDate).toBe("2030-08-12");
  });

  it("extracts certificate review fields", () => {
    const suggestion = parseScannerOcrText("STCW Basic Safety Certificate number BST-7788 date of issue 2026-01-10 valid until 10 Jan 2031");

    expect(suggestion.source).toBe("certificate");
    expect(suggestion.input.type).toBe("certificate");
    expect(suggestion.input.number).toBe("BST-7788");
    expect(suggestion.input.issueDate).toBe("2026-01-10");
    expect(suggestion.input.expiryDate).toBe("2031-01-10");
  });
});
