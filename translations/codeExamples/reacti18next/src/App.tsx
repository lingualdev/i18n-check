// @ts-nocheck
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Content } from "./Content";

export const I18NextExample = () => {
  const { t } = useTranslation();

  const userName = "User One";

  return (
    <p className="example">
      <p>
        {t("some_placeholder", {
          defaultValue: "A fallback {{ val }} - just in case",
          val: "static value",
        })}
        {t("one", "Value one")}
        {t("two", "Value two")}
        {t("three", "Value three")}
        {t("more", "More!")}
      </p>

      <p>{t("testing.one", "Some default value")}</p>

      <Trans i18nKey="moreInformationLink">
        Welcome <b>{{ userName }}</b>, you can check for more information{" "}
        <a href="some-link">here</a>!
      </Trans>

      <div>
        <Trans i18nKey="content.intro" />
        <Content />
        <Trans i18nKey="content.outro" />
      </div>
    </p>
  );
};
