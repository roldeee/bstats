/*global location */
sap.ui.define([
		"base/stats/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"base/stats/model/formatter",
		"sap/ui/core/format/NumberFormat"
	], function (BaseController, JSONModel, formatter, NumberFormat) {
		"use strict";

		return BaseController.extend("base.stats.controller.Leader", {

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

				this.getRouter().getRoute("leader").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "detailView");

				this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
				
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
				var oSeason = this.byId("selSeason"),
					oStat = this.byId("selStat");
				if (oStat.getItems().length === 0){
					var aProps = this.getModel().oMetadata.mEntityTypes.AllTime.property;
					for (var i = 1; i < aProps.length; i++){
						var oProp = aProps[i];
						oStat.addItem(new sap.ui.core.Item().setText(oProp.name));
					}
					var oItem = new sap.ui.core.Item().setText("All");
					oSeason.addItem(oItem);
					oSeason.setSelectedItem(new sap.ui.core.Item().setText("All").setKey("0"));
				}
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
			
			onListItemPress : function(oEvent) {
				var item = oEvent.getParameters().listItem,
					context = item.getBindingContext(),
					sKey = "GID";
				this.getRouter().navTo("object", {objectId : context.getProperty(sKey)}, true);
			},
			
			onLeaderChange : function (oEvent) {
				var oSelStat = this.byId("selStat"),
					oSelSeason = this.byId("selSeason"),
					sStat = oSelStat.getSelectedItem().getText(),
					sSeason = oSelSeason.getSelectedItem().getKey(),
					oLeaders = this.byId("leaders"),
					factory = function	() {
						return new sap.m.ObjectListItem().bindProperty("title", {path : "Player/fname"}).bindProperty("number", {path : sStat});
					}, tablePath,
					aFilters = [];
				if (sSeason === "0"){
					tablePath = "/AllTime";
				}else {
					tablePath = "/Leaders";
					aFilters.push(new sap.ui.model.Filter("SID", "EQ", sSeason));
				}
				var oBinding = {
						path : tablePath,
						factory : factory,
						parameters : {
							expand : "Player"
						},
						sorter : new sap.ui.model.Sorter(sStat, true),
						filter : aFilters
					};
				oLeaders.bindItems(oBinding);
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */



			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				
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
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oElementBinding = oView.getElementBinding();
			},

			_onMetadataLoaded : function () {
				// Store original busy indicator delay for the detail view

			}

		});

	}
);