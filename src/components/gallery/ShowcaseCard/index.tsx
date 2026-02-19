import React, { useEffect, useState } from "react";
import { useLocation } from "@docusaurus/router";
import styleCSS from "./styles.module.css";
import {
  Card,
  CardFooter,
  DialogTrigger,
  Button,
} from "@fluentui/react-components";
import { useBoolean } from "@fluentui/react-hooks";
import ShowcaseCardTag from "../ShowcaseTag/index";
import ShowcaseDialog from "../ShowcaseDialog/index";

import type { User } from "../../../data/tags";
import { getButtonText } from "../../../utils/buttonTextUtils";
import OptimizedImage from "../../OptimizedImage";

const LEARNING_PATH_TAGS = [
  "developing-core-applications",
  "building-genai-apps",
  "building-ai-agents",
];

type GitHubRepoInfo = {
  forks: number;
  stars: number;
  updatedOn: Date;
} | null;

function ShowcaseCard({
  user,
  coverPage,
  fixedHeight,
  tileNumber,
}: {
  user: User;
  coverPage: boolean;
  fixedHeight?: number;
  tileNumber?: number;
}): JSX.Element {
  const tags = user.tags;
  const title = user.title;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTags = searchParams.getAll("tags");
  const isLearningPathFiltered =
    !coverPage && currentTags.some((tag) => LEARNING_PATH_TAGS.includes(tag));
  const shouldUseLearningPathContent =
    isLearningPathFiltered &&
    !!user.learningPathTitle &&
    !!user.learningPathDescription;
  const displayTitle = shouldUseLearningPathContent
    ? user.learningPathTitle!
    : title;
  const displayDescription = shouldUseLearningPathContent
    ? user.learningPathDescription!
    : user.description;

  const [isOpen, { setTrue: openDialog, setFalse: dismissDialog }] =
    useBoolean(false);

  const [githubData, setGithubData] = useState<GitHubRepoInfo>(null);

  const fetchGitHubData = async (owner: string, repo: string) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
      );

      if (response.status === 429) {
        console.error("Rate limit exceeded. Please try again later.");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        const repoData: GitHubRepoInfo = {
          forks: data.forks,
          stars: data.stargazers_count,
          updatedOn: new Date(data.updated_at),
        };
        setGithubData(repoData);
        localStorage.setItem(`${owner}/${repo}`, JSON.stringify(repoData));
      } else {
        console.error("Failed to fetch data:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (!user.source.includes("https://github.com/")) return;
    const repoSlug = user.source
      .toLowerCase()
      .replace("https://github.com/", "");
    const slugParts = repoSlug.split("/");
    const owner = slugParts[0];
    const repo = slugParts[1];
    fetchGitHubData(owner, repo);
  }, [user.source]);

  return (
    <ShowcaseDialog
      user={user}
      githubData={githubData}
      isOpen={isOpen}
      onClose={dismissDialog}
      titleOverride={displayTitle}
      descriptionOverride={displayDescription}
    >
      <DialogTrigger disableButtonEnhancement>
        <Card
          key={displayTitle}
          className={styleCSS.card}
          appearance="filled"
          onClick={openDialog}
          style={fixedHeight ? { height: fixedHeight } : undefined}
        >
          {/* Mobile-only tile number badge when a tileNumber is supplied (parent controls when to provide it) */}
          {tileNumber !== undefined && (
            <div className={styleCSS.mobileTileNumber}>{tileNumber}</div>
          )}
          {user.image && (
            <div className={styleCSS.imageContainer}>
              <OptimizedImage
                src={user.image}
                alt={displayTitle + " image"}
                objectFit="cover"
                style={{
                  width: "100%",
                  height: "200px",
                  display: "block",
                  borderRadius: "8px 8px 0px 0px",
                }}
              />
            </div>
          )}
          <div className={styleCSS.cardTags}>
            <ShowcaseCardTag
              key={displayTitle}
              tags={tags}
              cardPanel={false}
              buttonText={getButtonText(user.website, user.tags)}
            />
          </div>
          <div style={{ padding: 16 }}>
            {coverPage ? (
              <>
                <div className={styleCSS.cardTitleCoverPage}>
                  {displayTitle}
                </div>
                <div className={styleCSS.cardDescriptionCoverPage}>
                  {displayDescription}
                </div>
              </>
            ) : (
              <>
                <div className={styleCSS.cardTitle}>{displayTitle}</div>
                <div className={styleCSS.cardDescription}>
                  {displayDescription}
                </div>
              </>
            )}
          </div>
          {/* <CardFooter> */}
          {user.website && (
            <Button
              appearance="primary"
              as="a"
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                fontSize: "16px",
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
          {/* </CardFooter> */}
        </Card>
      </DialogTrigger>
    </ShowcaseDialog>
  );
}

export default React.memo(ShowcaseCard);
