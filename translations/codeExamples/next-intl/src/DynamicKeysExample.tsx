// @ts-nocheck
import { useTranslations } from "next-intl";

const DynamicKeysExample = () => {
  const t = useTranslations("dynamic.four");
  return (
    <div>
      {["one", "two", "three", "four"].map((key) => {
        let name = "";
        switch (key) {
          case "one":
            name = t("nameOne");
            break;
          case "two":
            name = t("nameTwo");
            break;
          case "three":
            name = t("nameThree");
            break;
          case "nameFour":
            name = t("nameFour");
            break;
          default:
            name = "";
        }

        return <div key={key}>{t(key)}</div>;
      })}
    </div>
  );
};

function CompanyStatsExample() {
  const t = useTranslations("dynamic");
  const keys = ["one", "two", "three"] as const;

  return (
    <ul>
      {keys.map((key) => (
        <li key={key}>
          <h2>{t(`${key}.title`)}</h2>
          <p>{t(`${key}.value`)}</p>
        </li>
      ))}
    </ul>
  );
}
