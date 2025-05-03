// @ts-nocheck
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Content } from './Content';

export const ReactIntlExample = () => {
  const intl = useIntl();

  return (
    <p className="example">
      <p>
        {intl.formatMessage({
          id: 'message.argument',
          defaultMessage: 'A fallback just in case',
        })}
      </p>

      <FormattedMessage id="message.plural">
        Welcome <b>{{ userName }}</b>, you can check for more information{' '}
        <a href="some-link">here</a>!
      </FormattedMessage>

      <FormattedMessage id="select" />

      <FormattedMessage id="message.select">
        Welcome <b>{userName}</b>, you can check for more information{' '}
        <a href="some-link">here</a>!
      </FormattedMessage>

      <FormattedMessage id="message.text-format">
        Welcome <b>{user}</b>!
      </FormattedMessage>

      <FormattedMessage id="nested.select" />

      <FormattedMessage id="some.key.that.is.not.defined" />
      <Content />
    </p>
  );
};
