/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import { Button } from '@fluentui/react-components';
import style from './styles.module.css';
import { shareFeedbackHandler } from '../../utils/githubUtils';

import React, { useState } from 'react';
import NewsletterDialog from './NewsletterDialog';
const submitFeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const handleClick = shareFeedbackHandler();
  return (
    <>
      <Button
        appearance="secondary"
        size="extra-large"
        iconPosition="before"
        shape="rounded"
        className={style.button}
        onClick={handleClick}
      >
        Share Feedback
      </Button>
      <NewsletterDialog open={open} setOpen={setOpen} />
    </>
  );
};

// eslint-disable-next-line import/no-unused-modules
export default {
  ...ComponentTypes,
  'custom-NavbarButton': submitFeedbackButton,
};
