// @ts-nocheck
import i18next from "i18next";

const returnObjectLike = i18next.t("possiblyUsed", {
  returnObjects: true,
});

const resolution = returnObjectLike["one"];
