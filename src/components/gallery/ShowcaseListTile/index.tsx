import React from "react";
import { User } from "../../../data/tags";
import {
  Button,
  Card,
  CardFooter,
  DialogTrigger,
} from "@fluentui/react-components";
import { useBoolean } from "@fluentui/react-hooks";
import styleCSS from "../ShowcaseCard/styles.module.css";
import ShowcaseDialog from "../ShowcaseDialog/index";
import ShowcaseCardTag from "../ShowcaseTag/index";
import { getButtonText } from "../../../utils/buttonTextUtils";
import OptimizedImage from "../../OptimizedImage";

export default function ShowcaseListTile({
  user,
  tileNumber,
}: {
  user: User;
  tileNumber?: number;
}) {
  const [isOpen, { setTrue: openDialog, setFalse: dismissDialog }] =
    useBoolean(false);
  const shouldUseLearningPathContent =
    !!user.learningPathTitle && !!user.learningPathDescription;
  const displayTitle = shouldUseLearningPathContent
    ? user.learningPathTitle!
    : user.title;
  const displayDescription = shouldUseLearningPathContent
    ? user.learningPathDescription!
    : user.description;

  return (
    <ShowcaseDialog
      user={user}
      isOpen={isOpen}
      onClose={dismissDialog}
      titleOverride={displayTitle}
      descriptionOverride={displayDescription}
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
              <div
                className={styleCSS.imageContainer}
                style={{ width: "200px", marginRight: "24px", flexShrink: 0 }}
              >
                <OptimizedImage
                  src={user.image}
                  alt={displayTitle + " image"}
                  className={styleCSS.listTileImage}
                  objectFit="cover"
                />
              </div>
            )}
            <div className={styleCSS.listTileText}>
              <div className={styleCSS.listTileTags}>
                <ShowcaseCardTag tags={user.tags} cardPanel={false} buttonText={getButtonText(user.website, user.tags)} />
              </div>
              <div className={styleCSS.listTitle}>{displayTitle}</div>
              <div className={styleCSS.cardDescription}>
                {displayDescription}
              </div>
              {user.website && (
                <Button
                  appearance="primary"
                  as="a"
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    marginTop: 12,
                    backgroundColor: "#0078d4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  }}
                >
                  <span>{getButtonText(user.website, user.tags)}</span>
                </Button>
              )}
            </div>
          </div>
          <CardFooter>
            {/* Add tags, icons, or other info here if needed */}
          </CardFooter>
        </Card>
      </DialogTrigger>
    </ShowcaseDialog>
  );
}
