import React, { useEffect, useState } from "react";
import styleCSS from "./styles.module.css";
import {
  Card,
  CardFooter,
  Caption1Strong,
  Image,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  Button,
  DialogTitle,
} from "@fluentui/react-components";
import { useBoolean } from "@fluentui/react-hooks";
// Removed unused Panel, ThemeProvider, PartialTheme imports
import ShowcaseCardPanel from "../ShowcaseCardPanel/index";
import ShowcaseCardTag from "../ShowcaseTag/index";
import ShowcaseCardIcon from "../ShowcaseIcon/index";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import siteConfig from "@generated/docusaurus.config";

import type { User } from "../../../data/tags-copy";
import { X } from "lucide-react";

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
  console.log("user in card:", user);
  const [isOpen, { setTrue: openDialog, setFalse: dismissDialog }] =
    useBoolean(false);

  const [githubData, setGithubData] = useState<GitHubRepoInfo>(null);

  const fetchGitHubData = async (owner: string, repo: string) => {
    const token = siteConfig.customFields.REACT_APP_GITHUB_TOKEN;
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        }
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
    const repoSlug = user.source
      .toLowerCase()
      .replace("https://github.com/", "");
    const slugParts = repoSlug.split("/");
    const owner = slugParts[0];
    const repo = slugParts[1];
    console.log("Fetching GitHub data forrrrrrrrrrr", owner, repo);

    // Check if data is already in local storage
    const cachedData = localStorage.getItem(`${owner}/${repo}`);
    if (cachedData) {
      setGithubData(JSON.parse(cachedData));
      console.log("Using cached GitHub data for:", owner, repo);
    } else {
      fetchGitHubData(owner, repo);
    }
  }, [user.source]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(_e, data) => {
        if (!data.open) dismissDialog();
      }}
    >
      <DialogTrigger disableButtonEnhancement>
        <Card
          key={title}
          className={styleCSS.card}
          appearance="filled"
          onClick={openDialog}
        >
          {user.image && (
            <img
              src={user.image}
              alt={title + " image"}
              style={{
                width: "100%",
                height: 200,
                objectFit: "cover",
                borderRadius: "8px 0px 0px",
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
            {user.website && (
              <Button
                appearance="primary"
                as="a"
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  margin: "16px 0 0 0",
                  width: "100%",
                  fontSize: "16px",
                  backgroundColor: "#0078d4",
                }}
              >
                Read More
              </Button>
            )}
          </div>

          {/* <div className={styleCSS.cardFooterTag}>
            <ShowcaseCardIcon key={title} tags={tags} />
          </div>
          <GitHubInfo githubData={githubData} /> */}
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
          <ShowcaseCardPanel user={user} githubData={githubData} />
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

const GitHubInfo = ({ githubData }) => {
  const formatNumber = (number: number): string => {
    return Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(number);
  };

  if (!githubData) return null;

  const { colorMode } = useColorMode();

  return (
    <div className={styleCSS.gitHubData}>
      {formatNumber(githubData.forks) === "NaN" ? null : (
        <>
          <Image
            alt="fork"
            src={
              colorMode === "dark"
                ? useBaseUrl("/img/forkDark.svg")
                : useBaseUrl("/img/fork.svg")
            }
            height={16}
            width={16}
          />
          <Caption1Strong className={styleCSS.forkNumber}>
            {formatNumber(githubData.forks)}
          </Caption1Strong>
        </>
      )}
      {formatNumber(githubData.stars) === "NaN" ? null : (
        <>
          <Image
            alt="star"
            src={
              colorMode === "dark"
                ? useBaseUrl("/img/starDark.svg")
                : useBaseUrl("/img/star.svg")
            }
            height={16}
            width={16}
          />
          <Caption1Strong className={styleCSS.starNumber}>
            {formatNumber(githubData.stars)}
          </Caption1Strong>
        </>
      )}
    </div>
  );
};

export default React.memo(ShowcaseCard);
