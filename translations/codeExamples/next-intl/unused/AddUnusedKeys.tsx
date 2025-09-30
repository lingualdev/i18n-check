// @ts-nocheck
import { useTranslations } from 'next-intl';
import NavigationLink from './NavigationLink';

// We use this for checking the CLI doesn't fail when there are no unused keys
export default function AddUnusedKeys() {
  const t = useTranslations();

  return (
    <div>
      {t('notUsedKey')}
      {t('message.plural')}
    </div>
  );
}
