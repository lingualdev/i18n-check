// https://github.com/amannn/next-intl/blob/main/examples/example-pages-router-advanced/src/pages/strict-types.tsx
// @ts-nocheck
import { NextIntlClientProvider, useTranslations } from "next-intl";

function StrictTypesExample() {
  useTranslations("StrictTypes")("nested.hello");
  useTranslations("StrictTypes.nested")("another.level");
  useTranslations("About")("title");
  useTranslations("About")("lastUpdated");
  useTranslations("Navigation")("about");
  useTranslations()("About.title");
  useTranslations()("Navigation.about");
  useTranslations("NotFound")("title");
  useTranslations("PageLayout")("pageTitle");

  // @ts-expect-error Trying to access a child key without a namespace
  useTranslations()("title");

  // @ts-expect-error Only partial namespaces are allowed
  useTranslations("About.title");

  // @ts-expect-error Trying to access a key from another namespace
  useTranslations("Test")("title");

  // @ts-expect-error Invalid namespace
  useTranslations("Unknown");

  // @ts-expect-error Invalid key on global namespace
  useTranslations()("unknown");

  // @ts-expect-error Invalid key on valid namespace
  useTranslations("About")("unknown");

  // @ts-expect-error Invalid namespace and invalid key
  useTranslations("unknown")("unknown");

  /**
   * `t.rich`
   */

  // Correct property access
  useTranslations("StrictTypes").rich("nested.hello");
  useTranslations("StrictTypes.nested").rich("another.level");
  useTranslations("About").rich("title");
  useTranslations("About").rich("lastUpdated");
  useTranslations("Navigation").rich("about");
  useTranslations().rich("About.title");
  useTranslations().rich("Navigation.about");
  useTranslations("NotFound").rich("title");
  useTranslations("PageLayout").rich("pageTitle");

  // @ts-expect-error Trying to access a child key without a namespace
  useTranslations().rich("title");

  // @ts-expect-error Only partial namespaces are allowed
  useTranslations("About.title");

  // @ts-expect-error Trying to access a key from another namespace
  useTranslations("Test").rich("title");

  // @ts-expect-error Invalid namespace
  useTranslations("Unknown");

  // @ts-expect-error Invalid key on global namespace
  useTranslations().rich("unknown");

  // @ts-expect-error Invalid key on valid namespace
  useTranslations("About").rich("unknown");

  // @ts-expect-error Invalid namespace and invalid key
  useTranslations("unknown").rich("unknown");

  /**
   * `t.raw`
   */

  // Correct property access
  useTranslations("StrictTypes").raw("nested.hello");
  useTranslations("StrictTypes.nested").raw("another.level");
  useTranslations("About").raw("title");
  useTranslations("About").raw("lastUpdated");
  useTranslations("Navigation").raw("about");
  useTranslations().raw("About.title");
  useTranslations().raw("Navigation.about");
  useTranslations("NotFound").raw("title");
  useTranslations("PageLayout").raw("pageTitle");

  // @ts-expect-error Trying to access a child key without a namespace
  useTranslations().raw("title");

  // @ts-expect-error Only partial namespaces are allowed
  useTranslations("About.title");

  // @ts-expect-error Trying to access a key from another namespace
  useTranslations("Test").raw("title");

  // @ts-expect-error Invalid namespace
  useTranslations("Unknown");

  // @ts-expect-error Invalid key on global namespace
  useTranslations().raw("unknown");

  // @ts-expect-error Invalid key on valid namespace
  useTranslations("About").raw("unknown");

  // @ts-expect-error Invalid namespace and invalid key
  useTranslations("unknown").raw("unknown");

  return <div>Done</div>;
}
