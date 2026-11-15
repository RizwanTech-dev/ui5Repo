sap.ui.define([
    "com/riztech/ui5app/project1/base/BaseController",
    "sap/m/GenericTile",
    "com/riztech/ui5app/project1/utils/Constant"

], (Controller, GenericTile, Constant) => {
    "use strict";

    return Controller.extend("com.riztech.ui5app.project1.container.dashboard.Dashboard", {

        onInit() {
            console.log("Welcome to Dashboard");
            this.fetchModules();
        },

        async fetchModules() {
            let path = Constant.URL.modules;
            try {
                let dbData = await this.restMethodGet(path);
                if (dbData && Array.isArray(dbData) && dbData.length > 0) {
                    // Filter to only include Birt tile for this scenario
                    let birtModules = dbData.filter(m => m.route === "birt" || (m.header && m.header.toLowerCase() === "birt"));
                    if (birtModules.length > 0) {
                        this.setTiles(birtModules);
                        return;
                    }
                }
            } catch (e) {
                console.warn("Could not fetch modules from backend, loading fallback modules:", e);
            }
            this.setTiles(this._getDefaultModules());
        },

        _getDefaultModules: function () {
            return [
                {
                    header: "Birt",
                    subheader: "BIRT Reports",
                    contentType: "icon",
                    content: "sap-icon://pdf-attachment",
                    footer: "Reports",
                    route: "birt"
                }
            ];
        },

        setTiles: function (dbData) {
            let obj = dbData || [];

            const container = this.getView().byId("tileContainer");
            if (!container) return;
            container.removeAllItems(); // Clear old tiles

            // Set container to flex row with wrapping
            container.setDirection("Row");
            container.setWrap("Wrap");

            obj.forEach((t) => {
                let oTileContent = {};

                if (t.contentType === "icon") {
                    oTileContent = {
                        content: new sap.m.NumericContent({
                            withMargin: false,
                            value: "25",
                            valueColor: "Critical",
                            indicator: "Up",
                            icon: t.content,
                        }),
                    };
                } else if (t.contentType === "src") {
                    oTileContent = {
                        content: new sap.m.Image({
                            src: t.content,
                            width: "50px",
                            decorative: false
                        })
                    };
                } else if (t.contentType === "contentText") {
                    oTileContent = {
                        content: new sap.m.FeedContent({
                            contentText: t.content
                        })
                    };
                } else {
                    oTileContent = {
                        content: new sap.m.NumericContent({
                            withMargin: false,
                            icon: "sap-icon://document"
                        })
                    };
                }

                let sRoute = t.route || "birt";

                let tile = new sap.m.GenericTile({
                    header: t.header,
                    state: "Loaded",
                    subheader: t.subheader,
                    tileContent: new sap.m.TileContent({
                        content: oTileContent.content,
                        footer: t.footer
                    }),
                    press: () => {
                        this.getRouter().navTo(sRoute);
                    }
                });
                tile.addStyleClass("sapUiSmallMarginBottom");
                tile.addStyleClass("sapUiSmallMarginEnd");
                container.addItem(tile);
            });
        }
    });
});
