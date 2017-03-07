jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Games in the list
// * All 3 Games have at least one Stats

sap.ui.require([
	"sap/ui/test/Opa5",
	"base/stats/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"base/stats/test/integration/pages/App",
	"base/stats/test/integration/pages/Browser",
	"base/stats/test/integration/pages/Master",
	"base/stats/test/integration/pages/Detail",
	"base/stats/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "base.stats.view."
	});

	sap.ui.require([
		"base/stats/test/integration/MasterJourney",
		"base/stats/test/integration/NavigationJourney",
		"base/stats/test/integration/NotFoundJourney",
		"base/stats/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});
