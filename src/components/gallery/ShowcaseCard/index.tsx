import React, { useEffect, useState } from "react";
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

type GitHubRepoInfo = {
  forks: number;
  stars: number;
  updatedOn: Date;
} | null;

function ShowcaseCard({
  user,
  coverPage,
}: {
  user: User;
  coverPage: Boolean;
}): JSX.Element {
  const tags = user.tags;
  const title = user.title;

  const [isOpen, { setTrue: openDialog, setFalse: dismissDialog }] =
    useBoolean(false);

  const [githubData, setGithubData] = useState<GitHubRepoInfo>(null);

  const fetchGitHubData = async (owner: string, repo: string) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`
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
    >
      <DialogTrigger disableButtonEnhancement>
        <Card
          key={title}
          className={styleCSS.card}
          appearance="filled"
          onClick={openDialog}
        >
          {user.image && (
            <OptimizedImage
              src={user.image}
              alt={title + " image"}
              height={200}
              objectFit="cover"
              style={{
                width: "100%",
                borderRadius: "8px 8px 0px 0px",
                marginBottom: 12,
              }}
            />
          )}
          <div className={styleCSS.cardTags}>
            <ShowcaseCardTag key={title} tags={tags} cardPanel={false} />
          </div>
          <div style={{ padding: 16 }}>
            {coverPage ? (
              <>
                <div className={styleCSS.cardTitleCoverPage}>{title}</div>
                <div className={styleCSS.cardDescriptionCoverPage}>
                  {user.description}
                </div>
              </>
            ) : (
              <>
                <div className={styleCSS.cardTitle}>{title}</div>
                <div className={styleCSS.cardDescription}>
                  {user.description}
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
              }}
            >
              {getButtonText(user.website)}
            </Button>
          )}
          {/* </CardFooter> */}
        </Card>
      </DialogTrigger>
    </ShowcaseDialog>
  );
}

export default React.memo(ShowcaseCard);
