// @ts-nocheck
import { useTranslations, _Translator } from 'next-intl';
import * as z from 'zod';
import { NextIntlTranslateFnAlias } from './types';
import { NextIntlTranslateFnOtherAlias } from './types';

export default function IndirectFunctionCallsExample() {
  const indirectFnCall = (t: NextIntlTranslateFnAlias<'Indirect5'>) => {
    const indirectTranslation = t('indirect5');
    // Do something with the indirectTranslation
  };

  const indirectT1 = useTranslations('Indirect5');
  indirectFnCall(indirectT1);

  const indirectFnCallWithMultipleParameters = (
    id: string,
    otherT: NextIntlTranslateFnOtherAlias<'Indirect6'>
  ) => {
    const indirectTranslation = otherT('indirect6');
    // Do something with the indirectTranslation
  };

  const indirectT2 = useTranslations('Indirect6');
  indirectFnCallWithMultipleParameters(indirectT2);

  const indirectFnWithTAsObjectPropertyCall = (
    someProperty: string,
    {
      t,
    }: {
      t: NextIntlTranslateFnAlias<'Indirect7'>;
    }
  ) => {
    const indirectTranslation = t('indirect7');
    // Do something with the indirectTranslation
  };

  const indirectT3 = useTranslations('Indirect7');
  indirectFnWithTAsObjectPropertyCall(indirectT3);

  const indirectFnCallWithNoNamespace = (
    id: string,
    otherT: NextIntlTranslateFnAlias
  ) => {
    const indirectTranslation = otherT('indirectNoNamespaceKeyThree');
    // Do something with the indirectTranslation
  };

  indirectFnCallWithNoNamespace(useTranslations());

  const indirectFnWithTAsObjectPropertyCallWithNoNamespace = (
    someProperty: string,
    {
      t,
    }: {
      t: NextIntlTranslateFnAlias;
    }
  ) => {
    const indirectTranslation = t('indirectNoNamespaceKeyFour');
    // Do something with the indirectTranslation
  };

  const indirectT4 = useTranslations();
  indirectFnWithTAsObjectPropertyCall(indirectT4);

  const someSchema = (t: NextIntlTranslateFnOtherAlias<'Indirect8'>) =>
    z.string().min(5, t('indirect8'));

  someSchema(useTranslations('Indirect8'));

  const t = useTranslations('Basic');

  return <div>{t('basic')}</div>;
}
