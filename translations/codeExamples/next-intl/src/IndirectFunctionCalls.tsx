// @ts-nocheck
import { useTranslations, _Translator } from 'next-intl';
import * as z from 'zod';

export default function IndirectFunctionCallsExample() {
  const indirectFnCall = (
    t: ReturnType<typeof useTranslations<'Indirect1'>>
  ) => {
    const indirectTranslation = t('indirect1');
    // Do something with the indirectTranslation
  };

  const indirectT1 = useTranslations('Indirect1');
  indirectFnCall(indirectT1);

  const indirectFnCallWithMultipleParameters = (
    id: string,
    otherT: ReturnType<typeof useTranslations<'Indirect2'>>
  ) => {
    const indirectTranslation = otherT('indirect2');
    // Do something with the indirectTranslation
  };

  const indirectT2 = useTranslations('Indirect2');
  indirectFnCallWithMultipleParameters(indirectT2);

  const indirectFnWithTAsObjectPropertyCall = (
    someProperty: string,
    {
      t,
    }: {
      t: ReturnType<typeof useTranslations<'Indirect3'>>;
    }
  ) => {
    const indirectTranslation = t('indirect3');
    // Do something with the indirectTranslation
  };

  const indirectT3 = useTranslations('Indirect3');
  indirectFnWithTAsObjectPropertyCall(indirectT3);

  const indirectFnCallWithNoNamespace = (
    id: string,
    otherT: ReturnType<typeof useTranslations>
  ) => {
    const indirectTranslation = otherT('indirectNoNamespaceKeyOne');
    // Do something with the indirectTranslation
  };

  indirectFnCallWithNoNamespace(useTranslations());

  const indirectFnWithTAsObjectPropertyCallWithNoNamespace = (
    someProperty: string,
    {
      t,
    }: {
      t: ReturnType<typeof useTranslations>;
    }
  ) => {
    const indirectTranslation = t('indirectNoNamespaceKeyTwo');
    // Do something with the indirectTranslation
  };

  const indirectT4 = useTranslations();
  indirectFnWithTAsObjectPropertyCall(indirectT4);

  const someSchema = (t: ReturnType<typeof useTranslations<'Indirect4'>>) =>
    z.string().min(5, t('indirect4'));

  someSchema(useTranslations('Indirect4'));

  const t = useTranslations('Basic');

  return <div>{t('basic')}</div>;
}
