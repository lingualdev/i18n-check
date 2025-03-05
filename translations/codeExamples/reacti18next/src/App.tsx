// @ts-nocheck
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Content } from "./Content";

const WrappedTransComponent = (props) => {
  return <Trans {...props} />;
};

export const I18NextExample = () => {
  const { t } = useTranslation();

  const userName = "User One";

  const returnObjectLike = t("returnObjectLike", { returnObjects: true });

  const resolution = returnObjectLike["one"];

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
        {t("some.key.that.is.not.defined", "Some key that is not defined!")}
      </p>

      <p>{t("testing.one", "Some default value")}</p>

      <Trans i18nKey="moreInformationLink">
        Welcome <b>{{ userName }}</b>, you can check for more information{" "}
        <a href="some-link">here</a>!
      </Trans>

      <WrappedTransComponent i18nKey="test.one">
        Welcome <b>{userName}</b>, you can check for more information{" "}
        <a href="some-link">here</a>!
      </WrappedTransComponent>

      <WrappedTransComponent i18nKey="user.one" ns="one">
        Welcome <b>{user}</b>!
      </WrappedTransComponent>

      <WrappedTransComponent
        i18nKey="some.deep.nested.key"
        ns="two"
        components={[
          <>
            <div />
          </>,
        ]}
      />

      <div>
        <Trans i18nKey="content.intro" />
        <Content />
        <Trans i18nKey="content.outro" />
      </div>
    </p>
  );
};
