// @ts-nocheck
import React from "react";
import { useTranslation, Trans } from "react-i18next";

export const Content = () => {
  const { t } = useTranslation();

  return (
    <p className="example">
      <Trans i18nKey="audio" />
      <Trans i18nKey="format.pdf" />

      {t("format.audio", "An audio format")}
    </p>
  );
};
