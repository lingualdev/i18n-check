// @ts-nocheck
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { SomeOtherComponent } from './SomeOtherComponent';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ name: string; locale: string }>;
}): Promise<Metadata> => {
  const { name, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'generate' });
  return {
    title: t('meta.data.title'),
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dynamic, locale } = await params;
  const t = await getTranslations({ locale });
  return {
    key: t('generate.meta.data.key'),
    otherKey: t('generate.meta.data.otherKey'),
  };
}

export default async function SomeFunction({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  return <SomeOtherComponent username={name} />;
}
