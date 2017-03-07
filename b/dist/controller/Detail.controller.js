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
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
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

			/**
			 * Event handler when the share by E-Mail button has been clicked
			 * @public
			 */
			onShareEmailPress : function () {
				var oViewModel = this.getModel("detailView");

				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			},


			/**
			 * Updates the item count within the line item table's header
			 * @param {object} oEvent an event containing the total number of items in the list
			 * @private
			 */
			onListUpdateFinished : function (oEvent) {
				var sTitle,
					iTotalItems = oEvent.getParameter("total"),
					oViewModel = this.getModel("detailView"),
					oTable = this.byId("lineItemsList"),
					aItems = oTable.getItems(),
					aTotals = new Array(13).fill(0),
					totalRow = new sap.m.ColumnListItem();

				// only update the counter if the length is final
				if (oTable.getBinding("items").isLengthFinal()) {
					if (iTotalItems) {
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
					} else {
						//Display 'Line Items' instead of 'Line items (0)'
						sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
					}
					oViewModel.setProperty("/lineItemListTitle", sTitle);
				}
				for(var i = 0; i < aItems.length; i++){
					var item = aItems[i],
						cells = item.getCells();
						for( var j = 1; j < aTotals.length + 1 ; j++){
							var cell = cells[j];
							aTotals[j-1] += parseInt(cell.getNumber());
						}
				}
				totalRow.addCell(new sap.m.ObjectIdentifier().setText("Total"));
				for(var i = 0 ; i < aTotals.length; i++){
					totalRow.addCell(new sap.m.ObjectNumber().setNumber(aTotals[i]));
				}
				totalRow.addCell(new sap.m.ObjectNumber().setNumber(this._battingAverage(aTotals)));
				totalRow.addCell(new sap.m.ObjectNumber().setNumber(this._onBasePercentage(aTotals)));
				totalRow.addCell(new sap.m.ObjectNumber().setNumber(this._slugging(aTotals)));
				totalRow.addCell(new sap.m.ObjectNumber().setNumber(this._ops(aTotals)));
				oTable.addItem(totalRow);
			},

			/**
			 * Event handler  for navigating back.
			 * It there is a history entry we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the master route.
			 * @public
			 */
			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("master", {}, true);
				}
			},
			
			onLeader : function() {
				this.getRouter().navTo("leader", {}, true);	
			},
			
			onAdd : function () {
				this.getRouter().navTo("add", {}, true);	
			},
			
			onListItemPress : function(oEvent) {
				var item = oEvent.getParameters().listItem,
					context = item.getBindingContext(),
					sKey = "PID";
				this.getRouter().navTo("player", {objectId : context.getProperty(sKey)}, true);
				/*if (this.byId("playerName").getVisible()){
					sKey = "GID";
					sType = "Games";
				}	
				var sValue = context.getProperty(sKey);	
				var sObjectPath = "/" + sType + "('" + sValue + "')";
				this.byId("playerName").setVisible(!this.byId("playerName").getVisible());
				this.byId("objectHeader").setVisible(!this.byId("objectHeader").getVisible());
				this.byId("playerCol").setVisible(!this.byId("playerCol").getVisible());
				this.byId("gameCol").setVisible(!this.byId("gameCol").getVisible());
				var oList = sap.ui.getCore().byId("__component0---master--list"),
					oBinding = {
						path : "/Players",
						factory : this.playerListFactory
					};
				oList.bindItems(oBinding);
				this._bindView(sObjectPath);*/
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */


			_battingAverage : function (aStats) {
				return this.statFormat1.format(aStats[5] / aStats[0]);	
			},
			
			_onBasePercentage: function (aStats) {
				return this.statFormat1.format((aStats[5] + aStats[8] + aStats[10]) / (aStats[0] + aStats[8] + aStats[10] + aStats[11]));
			},
			
			_slugging : function (aStats) {
				return this.statFormat2.format((aStats[1] + aStats[2] * 2 + aStats[3] * 3 + aStats[4] * 4) / aStats[0]);
			},
			
			_ops : function (aStats) {
				var a = ((aStats[1] + aStats[2] * 2 + aStats[3] * 3 + aStats[4] * 4) / aStats[0]) + ((aStats[5] + aStats[8] + aStats[10]) / (aStats[0] + aStats[8] + aStats[10] + aStats[11]));
				return this.statFormat2.format(a);
			},

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
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

			/**
			 * Binds the view to the object path. Makes sure that detail view displays
			 * a busy indicator while data for the corresponding element binding is loaded.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound to the view.
			 * @private
			 */
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

				var sPath = oElementBinding.getPath(),
					oResourceBundle = this.getResourceBundle(),
					oObject = oView.getModel().getObject(sPath),
					sObjectId = oObject.GAMEID,
					sObjectName = oObject.GAMEID,
					oViewModel = this.getModel("detailView");

				this.getOwnerComponent().oListSelector.selectAListItem(sPath);

				oViewModel.setProperty("/shareSendEmailSubject",
					oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
					oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
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