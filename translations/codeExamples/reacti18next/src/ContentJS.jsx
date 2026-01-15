import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

export const Content = () => {
  const { t } = useTranslation();

  return (
    <p className="example">
      <Trans i18nKey="audio" />
      <Trans i18nKey="format.pdf" />

      {t('format.doc', 'A doc format')}

      <div>{t('countedEntries', '{{count}} entries')}</div>
      <div>{t('countedEntriesTwo', '{{count}} entries')}</div>
    </p>
  );
};
