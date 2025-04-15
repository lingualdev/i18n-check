// @ts-nocheck
import { useTranslations } from "next-intl";
import NavigationLink from "./NavigationLink";

export default function NavigationExample() {
  const t = useTranslations("Navigation");

  return (
    <nav>
      <NavigationLink href="/">{t("home")}</NavigationLink>
      <NavigationLink href="/client">{t("client")}</NavigationLink>
      <NavigationLink href="/about">{t("about")}</NavigationLink>
      <NavigationLink href="/nested">{t("nested")}</NavigationLink>
      <NavigationLink href="/news">{t("news")}</NavigationLink>
    </nav>
  );
}

const BasicMessageComponent = () => {
  const t = useTranslations("message");

  return (
    <div>
      <div>{t("simple")}</div>
      <div>{t("select")}</div>
      <div>{t("argument")}</div>
    </div>
  );
};

export const NoNamespaceComponent = () => {
  // no namespace defined
  const t = useTranslations();

  return <div>{t("testKeyWithoutNamespace")}</div>;
};

export const NonUseTranslationsUsageOfT = () => {
  // no namespace defined
  const t = useOtherHook();

  return <div>{t("This should not be extraced")}</div>;
};
