// @ts-nocheck
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

export const Content = () => {
  const { t } = useTranslation();

  return (
    <p className="example">
      <p>{t(($) => $.selector.example.one)}</p>

      <p>
        {t(function ($) {
          return $.selector.example.two;
        })}
      </p>

      <div>
        {t(($) => {
          return $.selector.example.three;
        })}
      </div>
      <p>{t(($) => $['selector.example.four'])}</p>
    </p>
  );
};
