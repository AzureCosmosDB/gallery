import React from "react";
import { User } from "../../../data/tags-copy";
import {
  Button,
  Card,
  CardFooter,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
} from "@fluentui/react-components";
import { useBoolean } from "@fluentui/react-hooks";
import { X } from "lucide-react";
import styleCSS from "../ShowcaseCard/styles.module.css";
import ShowcaseCardPanel from "../ShowcaseCardPanel/index";

export default function ShowcaseListTile({
  user,
  tileNumber,
}: {
  user: User;
  tileNumber?: number;
}) {
  const [isOpen, { setTrue: openDialog, setFalse: dismissDialog }] =
    useBoolean(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(_e, data) => {
        if (!data.open) dismissDialog();
      }}
    >
      <DialogTrigger disableButtonEnhancement>
        <Card
          className={styleCSS.listTile}
          appearance="filled"
          style={{ position: "relative", cursor: "pointer" }}
          onClick={openDialog}
        >
          {/* Tile Number at top right corner */}
          {tileNumber !== undefined && (
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 16,
                fontWeight: 700,
                fontSize: 18,
                color: "#0078d4",
                background: "#eaf3fc",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tileNumber}
            </div>
          )}
          <div className={styleCSS.listTileContent}>
            {user.image && (
              <img
                src={user.image}
                alt={user.title + " image"}
                className={styleCSS.listTileImage}
              />
            )}
            <div className={styleCSS.listTileText}>
              <div className={styleCSS.listTitle}>{user.title}</div>
              <div className={styleCSS.cardDescription}>{user.description}</div>
              {user.website && (
                <Button
                  appearance="primary"
                  as="a"
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: 12, backgroundColor: "#0078d4" }}
                >
                  Read More
                </Button>
              )}
            </div>
          </div>
          <CardFooter>
            {/* Add tags, icons, or other info here if needed */}
          </CardFooter>
        </Card>
      </DialogTrigger>
      <DialogSurface>
        <DialogTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<X />}
              onClick={dismissDialog}
              style={{ position: "absolute", top: 12, right: 12 }}
            />
          }
          style={{
            color: "var(--ifm-color-text-ai-site)",
            fontSize: 26,
            fontWeight: 600,
            lineHeight: "32px",
          }}
        >
          {user.title}
        </DialogTitle>
        <DialogBody style={{ display: "block" }}>
          <ShowcaseCardPanel user={user} githubData={null} />
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
