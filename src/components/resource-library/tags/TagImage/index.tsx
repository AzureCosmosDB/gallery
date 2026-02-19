import React from "react";
import { Tooltip, Image, Button } from "@fluentui/react-components";
import useBaseUrl from "@docusaurus/useBaseUrl";

export function TagImage({ tagObject }) {
  return (
    <>
      <Tooltip withArrow content={tagObject.label} relationship="label">
        <Button
          icon={
            <Image alt={tagObject.label} src={useBaseUrl(tagObject.icon)} height={16} width={16} />
          }
        />
      </Tooltip>
    </>
  );
}
