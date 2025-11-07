/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import ComponentTypes from "@theme-original/NavbarItem/ComponentTypes";
import {
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
} from "@fluentui/react-components";
import { StarRegular } from "@fluentui/react-icons";
import style from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";

import React, { useState } from "react";
import NewsletterDialog from "./NewsletterDialog";
const submitFeedbackButton = () => {
  const { colorMode } = useColorMode();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        appearance="secondary"
        size="extra-large"
        iconPosition="before"
        shape="rounded"
        className={style.button}
        onClick={() => {}}
        disabled
      >
        Share Feedback
      </Button>
      <NewsletterDialog open={open} setOpen={setOpen} />
    </>
  );
};

// const submitStarButton = () => {
//   return (
//     <Button
//       appearance="secondary"
//       size="small"
//       iconPosition="before"
//       shape="rounded"
//       icon={
//         <Image
//           alt="feedback"
//           src={useBaseUrl("/img/github.svg")}
//           height={20}
//           width={20}
//         />
//       }
//       className={style.button}
//       onClick={() => {
//         window.open("https://github.com/AzureCosmosDB/gallery/", "_blank");
//       }}
//     >
//       Give a ★
//     </Button>
//   );
// };

export default {
  ...ComponentTypes,
  "custom-NavbarButton": submitFeedbackButton,
  // "custom-NavbarButtonGithub": submitStarButton,
};
