import React from "react";
import { User } from "../../../data/tags-copy";
import { Button, Card, CardFooter } from "@fluentui/react-components";
import styleCSS from "../ShowcaseCard/styles.module.css";

export default function ShowcaseListTile({
  user,
  tileNumber,
}: {
  user: User;
  tileNumber?: number;
}) {
  return (
    <Card
      className={styleCSS.listTile}
      appearance="filled"
      style={{ position: "relative" }}
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
  );
}
