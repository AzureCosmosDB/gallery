import React from "react";
import { Dialog, DialogSurface, DialogBody, DialogTitle, Button } from "@fluentui/react-components";
import { X } from "lucide-react";
import ShowcaseCardPanel from "../ShowcaseCardPanel/index";
import { User } from "src/data/tags";

type GitHubRepoInfo = {
  forks: number;
  stars: number;
  updatedOn: Date;
} | null;

interface ShowcaseDialogProps {
  user: User;
  githubData?: GitHubRepoInfo;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactElement;
  titleOverride?: string;
  descriptionOverride?: string;
}

export default function ShowcaseDialog({
  user,
  githubData = null,
  isOpen,
  onClose,
  children,
  titleOverride,
  descriptionOverride,
}: ShowcaseDialogProps): JSX.Element {
  const dialogTitle = titleOverride || user.title;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(_e, data) => {
        if (!data.open) onClose();
      }}
    >
      {children}
      <DialogSurface>
        <DialogTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<X />}
              onClick={onClose}
              style={{ position: "absolute", top: 12, right: 12 }}
            />
          }
          style={{
            color: "var(--ifm-color-text-ai-site)",
            fontSize: 26,
            fontWeight: 600,
            lineHeight: "32px",
            padding: "0px 15px 0px 0px",
          }}
        >
          {dialogTitle}
        </DialogTitle>
        <DialogBody style={{ display: "block" }}>
          <ShowcaseCardPanel
            user={user}
            githubData={githubData}
            descriptionOverride={descriptionOverride}
          />
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
