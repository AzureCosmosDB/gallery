/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */ 

import ComponentTypes from "@theme-original/NavbarItem/ComponentTypes";
import React from "react";
import { Button, Image } from "@fluentui/react-components";
import useBaseUrl from "@docusaurus/useBaseUrl";
import style from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";

const submitFeedbackButton = () => {
  const { colorMode } = useColorMode();
  return (
    <Button
      appearance="secondary"
      size="extra-large"
      iconPosition="before"
      shape="rounded"
      icon={
        <Image
          alt="feedback"
          src={colorMode =="dark" ? useBaseUrl("/img/personFeedbackdDark.svg") : useBaseUrl("/img/personFeedback.svg")}
          height={20}
          width={20}
        />
      }
      className={style.button}
      onClick={() => {
        window.open(
          "https://aka.ms/vcoredevtools",
          "_blank"
        );
      }}
    >
      Submit Feedback
    </Button>
  );
};

export default {
  ...ComponentTypes,
  "custom-NavbarButton": submitFeedbackButton,
};
