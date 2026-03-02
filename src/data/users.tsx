/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable global-require */

import { sortBy } from "../utils/jsUtils";
import { TagType, User, Tags } from "./tags";
import templates from "../../static/templates.json";

// *** ADDING DATA TO AZD GALLERY ****/

// Currently using Custom Issues on Repo

// *************** CARD DATA STARTS HERE ***********************
// Add your site to this list
// prettier-ignore

export const unsortedUsers: User[] = (templates as User[]).map((user, index) => ({
  ...user,
  order: index + 1 // Assign order based on position in templates.json (1-indexed)
}));

export const TagList = Object.keys(Tags) as TagType[];

function sortUsers() {
  let result = unsortedUsers;
  // Sort by site name
  result = sortBy(result, (user) => user.title.toLowerCase());
  return result;
}

// Function to get users in original template.json order
export function getUsersInOriginalOrder(): User[] {
  return sortBy(unsortedUsers, (user) => user.order || 0);
}

export const sortedUsers = sortUsers();

export const featuredUsers = sortedUsers.filter((user) =>
  user.tags.includes("featured")
);
