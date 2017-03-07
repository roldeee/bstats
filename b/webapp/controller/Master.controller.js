/*global history */
sap.ui.define([
		"base/stats/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/GroupHeaderListItem",
		"sap/ui/Device",
		"base/stats/model/formatter"
	], function (BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, Device, formatter) {
		"use strict";

		return BaseController.extend("base.stats.controller.Master", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit : function () {
				// Control state model
				var oList = this.byId("list"),
					oViewModel = new JSONModel({
					isFilterBarVisible: false,
					filterBarLabel: "",
					delay: 0,
					title: this.getResourceBundle().getText("masterTitleCount", [0]),
					noDataText: this.getResourceBundle().getText("masterListNoDataText"),
					sortBy: "GAMEID",
					groupBy: "None"
				}),
					iOriginalBusyDelay = oList.getBusyIndicatorDelay();


				this._oList = oList;
				// keeps the filter and search state
				this._oListFilterState = {
					aSearch : []
				};

				this.setModel(oViewModel, "masterView");
				oList.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for the list
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				});

				this.getView().addEventDelegate({
					onBeforeFirstShow: function () {
						this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
					}.bind(this)
				});
				
				this.getRouter().getRoute("player").attachPatternMatched(this._onPlayerMatched, this);
				this.getRouter().getRoute("object").attachPatternMatched(this._onGameMatched, this);
				this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
				this.getRouter().attachBypassed(this.onBypassed, this);
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */


			onUpdateFinished : function (oEvent) {
				// update the master list object counter after new data is loaded
				this._updateListItemCount(oEvent.getParameter("total"));
				// hide pull to refresh if necessary
				this.byId("pullToRefresh").hide();
			},

			//Simple serach by filtering on game no.
			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					this.onRefresh();
					return;
				}

				var sQuery = oEvent.getParameter("query");

				if (sQuery) {
					this._oListFilterState.aSearch = [new Filter("gameno", FilterOperator.Contains, sQuery)];
				} else {
					this._oListFilterState.aSearch = [];
				}

			},
			
			onRefresh : function () {
				this._oList.getBinding("items").refresh();
			},

			
			onSelectionChange : function (oEvent) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
			},

			//If no hash patern matched, remove any selections 
			onBypassed : function () {
				this._oList.removeSelections(true);
			},

			
			onNavBack : function() {
				history.go(-1);
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */


			_createViewModel : function() {
				return new JSONModel({
					isFilterBarVisible: false,
					filterBarLabel: "",
					delay: 0,
					title: this.getResourceBundle().getText("masterTitleCount", [0]),
					noDataText: this.getResourceBundle().getText("masterListNoDataText"),
					sortBy: "GAMEID",
					groupBy: "None"
				});
			},

			_onMasterMatched :  function() {
				this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(
					function (mParams) {
						if (mParams.list.getMode() === "None") {
							return;
						}
						var sObjectId = mParams.firstListitem.getBindingContext().getProperty("GAMEID");
						this.getRouter().navTo("object", {objectId : sObjectId}, true);
					}.bind(this),
					function (mParams) {
						if (mParams.error) {
							return;
						}
						this.getRouter().getTargets().display("detailNoObjectsAvailable");
					}.bind(this)
				);
			},
			
			_onPlayerMatched : function() {
				var oList = this.byId("list"),
					sPath = "/Players",
					oBinding = {
						path : sPath,
						factory : this.playerListFactory
					};
				if (oList.getBindingPath("items") !== sPath){
					this.byId("page").setTitle(this.getResourceBundle().getText("masterPlayerCount", [0]));
					oList.removeSelections(true);
					oList.bindItems(oBinding);
				}
			},
			
			_onGameMatched : function() {
				var oList = this.byId("list"),
					sPath = "/Games",
					oBinding = {
						path : sPath,
						parameters : {
							expand: "Home,Away,Season"},
						factory : this.gameListFactory
					};
				if (oList.getBindingPath("items") !== sPath){
					oList.removeSelections(true);
					oList.bindItems(oBinding);
				}
			},


			_showDetail : function (oItem) {
				var bReplace = !Device.system.phone,
					sId = oItem.getBindingContext().getProperty("GAMEID");
				if (sId){
					this.getRouter().navTo("object", {
						objectId : sId
					}, bReplace);
				}else{
					this.getRouter().navTo("player", {
						objectId : oItem.getBindingContext().getProperty("PLAYERID")
					}, bReplace);
				}
			},

			//updates the list length in the header
			_updateListItemCount : function (iTotalItems) {
				var sTitle;
				// only update the counter if the length is final
				if (this._oList.getBinding("items").isLengthFinal()) {
					var ref = "masterTitleCount";
					if(this._oList.getBindingPath("items") === "/Players"){
						ref = "masterPlayerCount";
					}
					sTitle = this.getResourceBundle().getText(ref, [iTotalItems]);
					this.getModel("masterView").setProperty("/title", sTitle);
				}
			}

		});

	}
);