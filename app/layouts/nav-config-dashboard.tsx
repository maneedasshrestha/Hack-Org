import { SvgColor } from "@/components/svg-color";

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} />
);

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: icon("ic-analytics"),
  },
  {
    title: "Website",
    path: "/website",
    icon: icon("ic-website"),
  },
  {
    title: "Participants",
    path: "/user",
    icon: icon("ic-user"),
  },
  {
    title: "Mentors",
    path: "/mentors",
    icon: icon("ic-mentor"),
  },
  {
    title: "Itenary",
    path: "/blog",
    icon: icon("ic-blog"),
  },
  {
    title: "Certificate",
    path: "/certificate",
    icon: icon("ic-certificate"),
  },
  {
    title: "Mailer",
    path: "/mail",
    icon: icon("ic-mail"),
  },
  {
    title: "Countdown",
    path: "/countdown",
    icon: icon("ic-countdown"),
  },
];
