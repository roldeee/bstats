/*global location */
sap.ui.define([
		"base/stats/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"base/stats/model/formatter",
		"sap/ui/core/format/NumberFormat"
	], function (BaseController, JSONModel, formatter, NumberFormat) {
		"use strict";

		return BaseController.extend("base.stats.controller.Detail", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit : function () {
				
				var oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
				});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "detailView");

				this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
				
				this.statFormat1 = sap.ui.core.format.NumberFormat.getFloatInstance({
					maxIntegerDigits: 0,
					maxFractionDigits: 3,
					minFractionDigits: 3
				});
				this.statFormat2 = sap.ui.core.format.NumberFormat.getFloatInstance({
					maxIntegerDigits: 1,
					maxFractionDigits: 3,
					minFractionDigits: 3
				});
			},
			

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */


			


			onNavBack : function() {
				var sPreviousHash = history.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("master", {}, true);
				}
			},
			
			
			onListItemPress : function(oEvent) {
				var item = oEvent.getParameters().listItem,
					context = item.getBindingContext(),
					sKey = "PID";
				this.getRouter().navTo("player", {objectId : context.getProperty(sKey)}, true);

			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */



			//Creates a key for and binds the correct object to the view
			_onObjectMatched : function (oEvent) {
				this.byId("lineItemsList").destroyItems();
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("Games", {
						GAMEID :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
			},

			_bindView : function (sObjectPath) {
				// Set busy indicator during view binding
				var oViewModel = this.getModel("detailView");

				// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("detailObjectNotFound");
					// if object could not be found, the selection in the master list
					// does not make sense anymore.
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
					return;
				}

			},

			_onMetadataLoaded : function () {
				// Store original busy indicator delay for the detail view
				var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
					oViewModel = this.getModel("detailView"),
					oLineItemTable = this.byId("lineItemsList"),
					iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

				// Make sure busy indicator is displayed immediately when
				// detail view is displayed for the first time
				oViewModel.setProperty("/delay", 0);
				oViewModel.setProperty("/lineItemTableDelay", 0);

				oLineItemTable.attachEventOnce("updateFinished", function() {
					// Restore original busy indicator delay for line item table
					oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
				});

				// Binding the view will set it to not busy - so the view is always busy if it is not bound
				oViewModel.setProperty("/busy", true);
				// Restore original busy indicator delay for the detail view
				oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
			}

		});

	}
);