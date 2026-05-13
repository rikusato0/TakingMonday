import { EXTERNAL } from './links';

/** Shared social icons/URLs for Loading + Main page footers. */
export type MainSocialConfig = {
  key: string;
  label: string;
  url: string;
  icon: ReturnType<typeof require>;
  iconWidth: number;
  iconHeight: number;
};

export const MAIN_PAGE_SOCIALS: MainSocialConfig[] = [
  {
    key: 'tyler',
    label: 'TYLER',
    url: EXTERNAL.tiktokTyler,
    icon: require('../../assets/landing/tiktok_tyler.png'),
    iconWidth: 56,
    iconHeight: 64,
  },
  {
    key: 'linktree',
    label: 'LINKTREE',
    url: EXTERNAL.linktree,
    icon: require('../../assets/landing/linktree.png'),
    iconWidth: 50,
    iconHeight: 60,
  },
  {
    key: 'darnail',
    label: 'DARNAIL',
    url: EXTERNAL.tiktokDarnail,
    icon: require('../../assets/landing/tiktok_darnail.png'),
    iconWidth: 56,
    iconHeight: 64,
  },
];
