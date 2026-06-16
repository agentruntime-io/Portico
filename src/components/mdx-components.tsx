import { Note, Warning, Info } from "@/components/mdx-callouts";
import { Card, CardGroup, Icon } from "@/components/mdx-cards";
import {
  Accordion,
  AccordionGroup,
  CodeGroup,
  Expandable,
  Frame,
  Tab,
  Tabs,
} from "@/components/mdx-layout";
import { MdxLocalizedLink } from "@/components/mdx-localized-link";
import { Step, Steps } from "@/components/mdx-steps";

export const mdxComponents = {
  Steps,
  Step,
  Note,
  Warning,
  Info,
  Card,
  CardGroup,
  Icon,
  Tabs,
  Tab,
  CodeGroup,
  Accordion,
  AccordionGroup,
  Frame,
  Expandable,
  a: MdxLocalizedLink,
};
