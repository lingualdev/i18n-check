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
        // Should be able to define static keys as comments:
        // t('one');
        // t('two');
        // t('three');
        // t('four');
        return <div key={key}>{t(key)}</div>;
      })}
    </div>
  );
};

function CompanyStatsExample() {
  const t = useTranslations("dynamic");
  const keys = ["one", "two", "three"] as const;

  // t('one.title');
  // t('one.value');
  // t('two.title');
  // t('two.value');
  // t('three.title');
  // t('three.value');
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
