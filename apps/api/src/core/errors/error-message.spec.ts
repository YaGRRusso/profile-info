import { COMMON_UNEXPECTED } from "./common.messages";
import { isErrorMessage, localizeError } from "./error-message";

describe("error messages", () => {
  it("recognizes the message contract", () => {
    expect(
      isErrorMessage({
        en: "Error",
        es: "Error",
        pt: "Erro",
      })
    ).toBe(true);
    expect(isErrorMessage({ en: "Error", pt: "Erro" })).toBe(false);
  });

  it("localizes supported languages and defaults to English", () => {
    expect(localizeError(COMMON_UNEXPECTED, "pt-BR")).toBe(
      COMMON_UNEXPECTED.pt
    );
    expect(localizeError(COMMON_UNEXPECTED, "es-ES")).toBe(
      COMMON_UNEXPECTED.es
    );
    expect(localizeError(COMMON_UNEXPECTED, "en-US")).toBe(
      COMMON_UNEXPECTED.en
    );
  });
});
