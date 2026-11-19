import type { DevlogIcon } from "./icons";

/**
 * The aampersand devlog posts, from each src/app/devlog/<slug>/post.json
 * "cover" block in ampersand-site (checked 19 Nov 2026). Months come from the
 * post's coverage dates. Add a line here when a new devlog goes up.
 */
export type DevlogPost = {
  number: number;
  title: string;
  color: string;
  icon: DevlogIcon;
  months: string;
  afterLine?: string;
};

export const DEVLOG_POSTS: DevlogPost[] = [
  { number: 1, title: "What if Icarus Had Sunscreen?", color: "#A0522D", icon: "sunscreen", months: "January 2026" },
  { number: 2, title: "Red Thread, Isle Eight", color: "#8B2E2E", icon: "yarn", months: "February 2026" },
  { number: 3, title: "Stranded in Crete", color: "#7A5C14", icon: "horns", months: "March 2026" },
  { number: 4, title: "Oily Bodies in Karpathos", color: "#2E6A78", icon: "baby-oil", months: "April 2026", afterLine: "on the island of Karpathos" },
  { number: 5, title: "Five Faces in the Water", color: "#1C3557", icon: "puddle", months: "May 2026", afterLine: "after Narcissus at the pool" },
  { number: 6, title: "The Shape of a Hero", color: "#4A1C4F", icon: "silhouette", months: "June 2026", afterLine: "after Theseus and the thread" },
  {
    number: 7,
    title: "Tilted Hermai",
    color: "#2D5A3D",
    icon: "column",
    months: "July–August 2026",
    afterLine: "after Hermes, keeper of the boundary stones",
  },
];

/** The /devlog index card. */
export const DEVLOG_INDEX = {
  color: "#5C6257",
  icon: "ampersand" as DevlogIcon,
  title: "The Founder's Log",
  afterLine: "Follow along as we build aampersand",
  url: "aampersand.com/devlog",
};
