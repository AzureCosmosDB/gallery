import React from "react";
import { Checkbox } from "@fluentui/react-components";
import { Tags, type TagType } from "../../../../data/tags";
import styles from "./styles.module.css";
import { getSubTagKeys } from "./utils/mobileFilters";

export function FilterSection({
  tags,
  activeTags,
  selected,
  onToggle,
  supportsSubTypes,
}: {
  tags: TagType[];
  activeTags: TagType[];
  selected: TagType[];
  onToggle: (tag: TagType) => void;
  supportsSubTypes?: boolean;
}) {
  return (
    <>
      {tags.map((tag) => {
        const tagObject = Tags[tag];
        const children = supportsSubTypes ? getSubTagKeys(tag) : [];
        const hasChildren = children.length > 0;
        const checked = selected.includes(tag);

        if (!hasChildren) {
          return (
            <div key={tag} className={styles.checkboxItem}>
              <Checkbox
                checked={checked}
                onChange={() => onToggle(tag)}
                label={tagObject.label}
                disabled={!activeTags.includes(tag)}
              />
            </div>
          );
        }

        return (
          <div key={tag} className={styles.nestedCheckboxGroup}>
            <div className={styles.checkboxItem}>
              <Checkbox
                checked={checked}
                onChange={() => onToggle(tag)}
                label={tagObject.label}
                disabled={!activeTags.includes(tag)}
              />
            </div>

            {checked && (
              <div className={styles.subCheckboxGroup}>
                {children.map((child) => {
                  const childObj = Tags[child];
                  return (
                    <div key={child} className={styles.checkboxItem}>
                      <Checkbox
                        checked={selected.includes(child)}
                        onChange={() => onToggle(child)}
                        label={childObj.label}
                        disabled={!activeTags.includes(child)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
