// @ts-nocheck
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

export const Content = () => {
  const intl = useIntl();

  return (
    <p className="example">
      <FormattedMessage id="test.drive.one" />
      <FormattedMessage id="test.drive.two" />
      <FormattedMessage id="test.drive.three" />
      <FormattedMessage id="test.drive.four" />

      {intl.formatMessage({ id: 'message.simple' })}
    </p>
  );
};
