// @ts-nocheck
import { getTranslations } from 'next-intl/server';

export default async function AsyncExampleOne() {
  const t = await getTranslations('Async');
  return <h1>{t('title')}</h1>;
}

export default async function AsyncExampleTwo() {
  const user = await fetchUser();
  const t = await getTranslations({
    locale: 'en',
    namespace: 'async.two',
  });

  return (
    <PageLayout title={t('title', { username: user.name })}>
      <UserDetails user={user} />
    </PageLayout>
  );
}
