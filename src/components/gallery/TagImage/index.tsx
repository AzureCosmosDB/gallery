import React from "react";
import { Tooltip, Image, Button } from "@fluentui/react-components";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";

export function TagImage({ tagObject }) {
  const { colorMode } = useColorMode();

  return (
    <>
      <Tooltip withArrow content={tagObject.label} relationship="label">
        <Button
          icon={
            <Image
              alt={tagObject.label}
              src={useBaseUrl(
                colorMode === "dark" && tagObject.darkIcon
                  ? tagObject.darkIcon
                  : tagObject.icon
              )}
              height={16}
              width={16}
            />
          }
        />
      </Tooltip>
    </>
  );
}
