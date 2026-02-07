import type { NextPage } from "next";

export type NextPageWithChrome = NextPage & {
  hideChrome?: boolean;
};
