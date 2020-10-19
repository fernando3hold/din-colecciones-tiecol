/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"dinosol/din-colecciones-tiecol/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});