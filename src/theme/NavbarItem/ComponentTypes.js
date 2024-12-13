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
          "https://microsoft.qualtrics.com/jfe/form/SV_cIRDC8WQdjKEmY6",
          "_blank"
        );
      }}
    >
      Submit Feedback
    </Button>
  );
};


const submitStarButton = () => {
   return (
    <Button
      appearance="secondary"
      size="small"
      iconPosition="before"
      shape="rounded"
      icon={
        <Image
          alt="feedback"
          src={useBaseUrl("/img/github.svg")}
          height={20}
          width={20}
        />
      }
      className={style.button}
      onClick={() => {
        window.open(
          "https://github.com/AzureCosmosDB/gallery/",
          "_blank"
        );
      }}
    >
      Give a ★
    </Button>
  );
};

export default {
  ...ComponentTypes,
  "custom-NavbarButton": submitFeedbackButton,
  "custom-NavbarButtonGithub": submitStarButton,
};
