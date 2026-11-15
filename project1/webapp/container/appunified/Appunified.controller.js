sap.ui.define([
    "com/riztech/ui5app/project1/base/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Avatar",
    "sap/ui/unified/FileUploader",
    "sap/m/Button",
    "com/riztech/ui5app/project1/utils/Constant"

], (Controller, JSONModel, Dialog, Avatar, FileUploader, Button, Constant) => {
    return Controller.extend("com.riztech.ui5app.project1.container.appunified.Appunified", {
        onInit() {
            // Default to userId 1 so profile picture and user data work even when login is bypassed
            this._userId = parseInt(sessionStorage.getItem("userId"), 10) || 1;
            this._profilePicFile = null;
            this.initializeModel();
            if (this._userId) {
                this._refetchUserProfile();
            }
        },
        onPressBack: function () {
            this.getRouter().navTo("dashboard");
        },
        onPressLink: function (oEvent) {
            let linkText = oEvent.getSource().getProperty("text");
            let obj = {
                name: "dashboard",
                tiles: [
                    {
                        header: "Dashboard",
                        route: "dashboard"
                    },
                    {
                        header: "Birt",
                        subheader: "sub",
                        icon: "sap-icon://pdf-attachment",
                        footer: "clock",
                        route: "birt"
                    }
                ]
            };

            let match = obj.tiles.find(f => f.header === linkText);
            if (match && match.route) {
                this.getRouter().navTo(match.route);
            }
        },
        // Profile Settings
        onPressProfile: function () {
            this.onClickProfileDialog();
        },
        initializeModel: function () {
            let users = {
                id: this._userId || 1,
                username: sessionStorage.getItem("username") || "rizwan",
                profilePic: ""
            };
            this.getView().setModel(new JSONModel(users));

        },
        onClickProfileDialog: function () {
            var that = this;

            if (!this.oDialog) {
                this.oDialog = new Dialog({
                    title: "Wanna change Profile?",
                    verticalScrolling: false,
                    content: [
                        new Avatar({
                            displaySize: "L",
                            displayShape: "Circle",
                            src: "{/profilePic}"
                        }).addStyleClass("sapUiSmallMarginBeginEnd sapUiSmallMarginBottom"),

                        new FileUploader({
                            width: "100%",
                            buttonText: "Choose image",
                            mimeType: ["image/jpeg", "image/png", "image/gif", "image/webp"],
                            change: this.onChangeFile.bind(this)
                        })
                    ],

                    beginButton: new Button({
                        text: "Upload",
                        type: "Emphasized",
                        press: function () {
                            that.onPressUpdateProfile();
                        }
                    }),

                    endButton: new Button({
                        text: "Cancel",
                        press: function () {
                            that.oDialog.close();
                        }
                    })
                });

                // set model on dialog so {/profilePic} binding works
                this.oDialog.setModel(this.getView().getModel());
            }

            this.oDialog.open();
        },

        onChangeFile: function (oEvent) {
            const file = oEvent.getParameter("files")[0];
            this._profilePicFile = file; // store for upload

            // Show local preview immediately in the dialog avatar
            const reader = new FileReader();
            reader.onload = function (e) {
                this.getView().getModel().setProperty("/profilePic", e.target.result);
            }.bind(this);
            reader.readAsDataURL(file);
        },

        onPressUpdateProfile: function () {
            if (!this._profilePicFile || !this._userId) return;

            var that = this;
            var formData = new FormData();
            formData.append("userId", this._userId);
            formData.append("file", this._profilePicFile, this._profilePicFile.name);

            var sUrl = Constant.URL.base + Constant.URL.uploadProfilePic;

            fetch(sUrl, {
                method: "POST",
                credentials: "include",
                body: formData
            })
            .then(function (response) {
                if (!response.ok) {
                    return response.text().then(function (t) { throw new Error(t); });
                }
                return response.json();
            })
            .then(function (data) {
                if (data && data.driveFileId) {
                    sessionStorage.setItem("driveFileId", data.driveFileId);
                }
                that._profilePicFile = null;
                that.oDialog.close();
                // Re-fetch authoritative image from Drive via backend proxy
                that._refetchUserProfile();
            })
            .catch(function (err) {
                console.error("Profile pic upload failed:", err);
            });
        },

        /**
         * Fetches the profile picture bytes from the backend proxy (which reads
         * from Google Drive) and sets it as a blob URL on the header Avatar.
         */
        _refetchUserProfile: function () {
            if (!this._userId) return;

            var that = this;
            var sUrl = Constant.URL.base + Constant.URL.getProfilePic + this._userId;

            fetch(sUrl, { method: "GET", credentials: "include" })
                .then(function (response) {
                    if (!response.ok || response.status === 204) {
                        return null;
                    }
                    return response.blob();
                })
                .then(function (blob) {
                    if (!blob) return;
                    var objectUrl = URL.createObjectURL(blob);
                    that.getView().getModel().setProperty("/profilePic", objectUrl);
                    that.byId("profileAvatar").setSrc(objectUrl);
                })
                .catch(function (err) {
                    console.error("Could not load profile picture:", err);
                });
        }
    });
});
