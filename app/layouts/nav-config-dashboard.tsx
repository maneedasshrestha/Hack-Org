import { Label } from "@/components/label";
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
    title: "Participants",
    path: "/user",
    icon: icon("ic-user"),
  },
  {
    title: "Mentors",
    path: "/mentors",
    icon: icon("ic-cart"),
    info: (
      <Label color="error" variant="inverted">
        +3
      </Label>
    ),
  },
  {
    title: "Itenary",
    path: "/blog",
    icon: icon("ic-blog"),
  },
  {
    title: "Sign in",
    path: "/sign-in",
    icon: icon("ic-lock"),
  },
  {
    title: "Not found",
    path: "/not-found",
    icon: icon("ic-disabled"),
  },
];
