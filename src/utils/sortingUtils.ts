/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 *
 * Sorting utilities for user/resource data.
 */

import type { User } from '../data/tags';
import { unsortedUsers } from '../data/users';

/** Available sort options */
export const SORT_BY_OPTIONS = ['Newest', 'Recommended'] as const;

/** Priority order mapping (P0 = highest = 0) */
const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2 };
const DEFAULT_PRIORITY = 3;

/**
 * Sorts users by newest date first.
 */
function sortByNewest(users: User[]): User[] {
  return users.slice().sort((a, b) => {
    const dateA = a.date || '1970-01-01';
    const dateB = b.date || '1970-01-01';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

/**
 * Sorts users by priority (P0 > P1 > P2), then solution-accelerator tag, then original order.
 */
function sortByRecommended(users: User[]): User[] {
  return users.slice().sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a.priority ?? ''] ?? DEFAULT_PRIORITY;
    const priorityB = PRIORITY_ORDER[b.priority ?? ''] ?? DEFAULT_PRIORITY;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    const hasSolAccelA = a.tags.includes('solution-accelerator');
    const hasSolAccelB = b.tags.includes('solution-accelerator');

    if (hasSolAccelA && !hasSolAccelB) return -1;
    if (!hasSolAccelA && hasSolAccelB) return 1;

    return (a.order ?? 0) - (b.order ?? 0);
  });
}

/**
 * Sorts users by original order (order field).
 */
function sortByOriginalOrder(users: User[]): User[] {
  return users.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Returns a sorted copy of `unsortedUsers` based on the given sort rule.
 * @param rule - One of SORT_BY_OPTIONS
 */
export function getSortedUsers(rule: string): User[] {
  switch (rule) {
    case 'Newest':
      return sortByNewest(unsortedUsers);
    case 'Recommended':
      return sortByRecommended(unsortedUsers);
    default:
      return sortByOriginalOrder(unsortedUsers);
  }
}
