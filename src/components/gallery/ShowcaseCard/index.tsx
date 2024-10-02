import React, { useEffect, useState } from "react";
import styleCSS from "./styles.module.css";
import { type User } from "../../../data/tags";
import {
  Card,
  CardFooter,
  Caption1Strong,
  Image,
} from "@fluentui/react-components";
import { useBoolean } from "@fluentui/react-hooks";
import { Panel, PanelType, ThemeProvider, PartialTheme } from "@fluentui/react";
import ShowcaseCardPanel from "../ShowcaseCardPanel/index";
import ShowcaseCardTag from "../ShowcaseTag/index";
import ShowcaseCardIcon from "../ShowcaseIcon/index";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import siteConfig from "@generated/docusaurus.config";

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
  console.log("###print user",user)
  const tags = user.tags;
  const title = user.title;
  const { colorMode } = useColorMode();

  const lightTheme: PartialTheme = {
    semanticColors: {
      bodyBackground: "#ffffff",
      bodyText: "#292929",
    },
  };

  const darkTheme: PartialTheme = {
    semanticColors: {
      bodyBackground: "#292929",
      bodyText: "#ffffff",
    },
  };

  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] =
    useBoolean(false);
  const [githubData, setGithubData] = useState<GitHubRepoInfo>(null);

  const fetchGitHubData = async (owner: string, repo: string) => {
    const token = siteConfig.customFields.REACT_APP_GITHUB_TOKEN;
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

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
    const repoSlug = user.source.toLowerCase().replace("https://github.com/", "");
    const slugParts = repoSlug.split("/");
    const owner = slugParts[0];
    const repo = slugParts[1];

    // Check if data is already in local storage
    const cachedData = localStorage.getItem(`${owner}/${repo}`);
    if (cachedData) {
      setGithubData(JSON.parse(cachedData));
    } else {
      fetchGitHubData(owner, repo);
    }
  }, [user.source]);

  return (
    <Card
      key={title}
      className={styleCSS.card}
      appearance="filled"
      onClick={openPanel}
    >
      <div>
        <ThemeProvider theme={colorMode !== "dark" ? lightTheme : darkTheme}>
          <Panel
            isLightDismiss
            isOpen={isOpen}
            onDismiss={dismissPanel}
            closeButtonAriaLabel="Close"
            type={PanelType.medium}
          >
            <ShowcaseCardPanel user={user} githubData={githubData} />
          </Panel>
        </ThemeProvider>
        {coverPage ? (
          <>
            <div className={styleCSS.cardTitleCoverPage}>{title}</div>
            <div className={styleCSS.cardDescriptionCoverPage}>{user.description}</div>
          </>
        ) : (
          <>
            <div className={styleCSS.cardTitle}>{title}</div>
            <div className={styleCSS.cardDescription}>{user.description}</div>
          </>
        )}
        <div className={styleCSS.cardTags}>
          <ShowcaseCardTag key={title} tags={tags} cardPanel={false} />
        </div>
      </div>
      <CardFooter>
        <div className={styleCSS.cardFooterTag}>
          <ShowcaseCardIcon key={title} tags={tags} />
        </div>
        <GitHubInfo githubData={githubData} />
      </CardFooter>
    </Card>
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
            src={colorMode === "dark" ? useBaseUrl("/img/forkDark.svg") : useBaseUrl("/img/fork.svg")}
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
            src={colorMode === "dark" ? useBaseUrl("/img/starDark.svg") : useBaseUrl("/img/star.svg")}
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
