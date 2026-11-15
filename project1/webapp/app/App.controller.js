sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("com.riztech.ui5app.project1.app.App", {
      onInit() {
        console.log("hello App");
      }
  });
});
