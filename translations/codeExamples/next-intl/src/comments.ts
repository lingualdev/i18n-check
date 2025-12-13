// @ts-nocheck

// Check for t function calls in single line comments
// someFunctiont("Should not count as a translation key")
// i18n-check t("some.key.as.comment")

// Should be able to find t function calls inside doc blocks
export const SomeObject = {
  /**
   * i18n-check t("some.key.inside.docblock")
   *
   * @example
   * const result = SomeObject.doThis('this.is.not.a.translation.key');
   *
   */
  doThis(id: string) {},

  /**
   *
   *
   * @example
   * const someMessage = t("some.example.translation.not.collected")
   * await SomeObject.doThat('this.is.also.not.a.translation.key', {
   *    msg: someMessage
   * });
   */
  async doThat(id: string, config: Record<string, unknown>) {},
};
