sap.ui.define([], function () {
    "use strict";

    return {
        URL: {
            base: "/srv/",

            dummy: "trigger_dummy",

            modules: "get_modules",

            //birt
            saveBirt: "birt/save",
            getBirtData: "birt/get_data",
            getBirtReports: "birt/get_available_reports",

            //users
            addUsers: "add_users",
            getUsers: "get_users",
            login: "login",
            uploadProfilePic: "users/upload_profile_pic",
            getProfilePic: "users/profile_pic/"
        }
    };
});
