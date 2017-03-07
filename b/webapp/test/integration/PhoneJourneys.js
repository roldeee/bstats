jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"base/stats/test/integration/NavigationJourneyPhone",
		"base/stats/test/integration/NotFoundJourneyPhone",
		"base/stats/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});

