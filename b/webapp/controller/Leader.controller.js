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

				this.getRouter().getRoute("leader").attachPatternMatched(this._onLeaderMatched, this);

				this.setModel(oViewModel, "detailView");

				
			},
			

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */


			//Hacky workaround that adds a "All" to the season filter 
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


			onNavBack : function() {
				var sPreviousHash = history.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("master", {}, true);
				}
			},
			
			//navigates to the selected player on the leader list
			onListItemPress : function(oEvent) {
				var item = oEvent.getParameters().listItem,
					context = item.getBindingContext(),
					sKey = "PID";
				this.getRouter().navTo("player", {objectId : context.getProperty(sKey)}, true);
			},
			
			//Chnages the output of the leader list based on stat/season
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


			//placeholder method for navigation to "leaders" page
			_onLeaderMatched : function (oEvent) {
				return;
			}

		});

	}
);