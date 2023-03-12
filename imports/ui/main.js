import { createApp } from "vue";
import { VueMeteor } from "vue-meteor-tracker";

import App from "./App.vue";
import { router } from "./router";
import "../api/methods/index";
import numeral from "numeral";

// load a locale
numeral.register("locale", "fr", {
  delimiters: {
    thousands: " ",
    decimal: ",",
  },
  abbreviations: {
    thousand: "k",
    million: "m",
    billion: "b",
    trillion: "t",
  },
  ordinal: function (number) {
    return number === 1 ? "er" : "ème";
  },
  currency: {
    symbol: "€",
  },
});
Meteor.startup(() => {
  const app = createApp(App);
  app.use(router);
  app.use(VueMeteor);
  app.mount("#app");
});
