// @ts-nocheck
import { useTranslations } from "next-intl";
import ClientCounter from "./ClientCounterExample";

export default function Counter() {
  const t = useTranslations("Counter");

  return (
    <ClientCounter
      messages={{
        count: t("count"),
        increment: t("increment"),
      }}
    />
  );
}
