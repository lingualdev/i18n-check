// @ts-nocheck
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function MultipleUsageOfUseTranslation() {
  const differentNameForT = useTranslations("aliasOne");
  const differentNameForOtherT = useTranslations("aliasTwo");

  return (
    <div>
      <p>{differentNameForT("keyOne")}</p>
      <p>{differentNameForOtherT("keyTwo")}</p>
    </div>
  );
}

function MultipleUsageOfNestedUseTranslation() {
  const t1 = useTranslations("aliasNestedOne");
  const nestedOne = () => {
    const t2 = useTranslations("aliasNestedTwo");
    const nestedTwo = () => {
      const t3 = useTranslations("aliasNestedThree");
      const nestedThree = () => {
        const t4 = useTranslations("aliasNestedFour");
        return t4("four");
      };
      return someCondition
        ? t3("three")
        : [t1("threeOne"), t2("threeTwo"), t3("threeThree")];
    };
    return t2("two");
  };
  return <div>{t1("one")}</div>;
}
