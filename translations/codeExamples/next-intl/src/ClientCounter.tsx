// @ts-nocheck
'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function ClientCounterOne() {
  const t = useTranslations('ClientCounter');
  const [count, setCount] = useState(0);

  function onIncrement() {
    setCount(count + 1);
  }

  return (
    <div data-testid="MessagesOnClientCounter">
      <p>{t('count', { count: String(count) })}</p>
      <button onClick={onIncrement} type="button">
        {t('increment')}
      </button>
    </div>
  );
}

export default function ClientCounterTwo() {
  const differentNameForT = useTranslations('ClientCounter2');
  const [count, setCount] = useState(0);

  function onIncrement() {
    setCount(count + 1);
  }

  return (
    <div data-testid="MessagesOnClientCounter">
      <p>{differentNameForT('count', { count: String(count) })}</p>
      <button onClick={onIncrement} type="button">
        {differentNameForT('increment')}
      </button>
    </div>
  );
}
