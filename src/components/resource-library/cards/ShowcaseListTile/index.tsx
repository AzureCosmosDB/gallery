import React from "react";
import { User } from "../../../../data/tags";
import { Button, Card, CardFooter, DialogTrigger } from "@fluentui/react-components";
import { useBoolean } from "@fluentui/react-hooks";
import styleCSS from "../ShowcaseCard/styles.module.css";
import localStyles from "./styles.module.css";
import ShowcaseDialog from "../ShowcaseDialog/index";
import ShowcaseCardTag from "../../tags/ShowcaseTag/index";
import { getButtonText } from "../../../../utils/buttonTextUtils";
import OptimizedImage from "../../../OptimizedImage";

export default function ShowcaseListTile({
  user,
  tileNumber,
}: {
  user: User;
  tileNumber?: number;
}) {
  const [isOpen, { setTrue: openDialog, setFalse: dismissDialog }] = useBoolean(false);
  const shouldUseLearningPathContent = !!user.learningPathTitle && !!user.learningPathDescription;
  const displayTitle = shouldUseLearningPathContent ? user.learningPathTitle! : user.title;
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
          className={`${styleCSS.listTile} ${localStyles.root}`}
          appearance="filled"
          onClick={openDialog}
        >
          {/* Tile Number at top right corner */}
          {tileNumber !== undefined && <div className={localStyles.tileNumber}>{tileNumber}</div>}
          <div className={styleCSS.listTileContent}>
            {user.image && (
              <div className={`${styleCSS.imageContainer} ${localStyles.imageInline}`}>
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
                <ShowcaseCardTag
                  tags={user.tags}
                  cardPanel={false}
                  buttonText={getButtonText(user.website)}
                />
              </div>
              <div className={styleCSS.listTitle}>{displayTitle}</div>
              <div className={styleCSS.cardDescription}>{displayDescription}</div>
              {user.website && (
                <Button
                  appearance="primary"
                  as="a"
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={localStyles.buttonInline}
                >
                  <span>{getButtonText(user.website)}</span>
                </Button>
              )}
            </div>
          </div>
          <CardFooter>{/* Add tags, icons, or other info here if needed */}</CardFooter>
        </Card>
      </DialogTrigger>
    </ShowcaseDialog>
  );
}
