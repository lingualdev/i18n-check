// @ts-nocheck
import { useTranslations } from "next-intl";

const TestComponentOne = () => {
  const t = useTranslations("nested.one");
  const nested = () => {
    return t("nestedKey");
  };
  return <div>{t("regularKey")}</div>;
};

function TestComponentTwo() {
  const t = useTranslations("nested.two");
  const nestedOne = () => {
    const nestedTwo = () => {
      const t = useTranslations("nested.nested.two");
      return t("nestedTwoKey");
    };
    return t("nestedKey");
  };
  return <div>{t("regularKey")}</div>;
}

function TestComponentThree() {
  const t = useTranslations("deepNested.level1");
  const nestedOne = () => {
    const t = useTranslations("deepNested.level2");
    const nestedTwo = () => {
      const t = useTranslations("deepNested.level3");
      const nestedThree = () => {
        const t = useTranslations("deepNested.level4");
        return t("four");
      };
      return t("three");
    };
    return t("two");
  };
  return <div>{t("one")}</div>;
}

const TestComponentFour = () => {
  const t = useTranslations("nested.three");

  return (
    <>
      <div>{t("basicKey")}</div>
      <div>{t.has("hasKeyCheck")}</div>
      <div>{t.rich("richTextKey", { underline: "<u>underline</u>" })}</div>
      <div>
        {t.markup("markupKey", {
          important: (chunks) => `<b>${chunks}</b>`,
        })}
      </div>
      <div>{t.html("htmlKey", { test: "one" })}</div>
    </>
  );
};
