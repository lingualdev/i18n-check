// @ts-nocheck
import { getTranslations } from 'next-intl/server';

import { loadData } from './loadData';

export const getData = async ({ id }) => {
  const [data, t] = await Promise.all([
    loadData(id),
    getTranslations('asyncPromiseAll'),
  ]);

  return {
    title: t('title', { id: data.id }),
    subtitle: t('subtitle'),
  };
};
