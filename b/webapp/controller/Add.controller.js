/*global location */
sap.ui.define([
		"base/stats/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"base/stats/model/formatter"
	], function (BaseController, JSONModel, formatter) {
		"use strict";

		return BaseController.extend("base.stats.controller.Add", {

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

				this.getRouter().getRoute("add").attachPatternMatched(this._onAddMatched, this);

				this.setModel(oViewModel, "detailView");

				
			},
			

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			//Changes which form is visible to submit new data
			onNewChange : function (oEvent) {
				var src = oEvent.getSource(),
					newId = src.getSelectedKey(),
					oldId = src.getLastItem().getKey(),
					newPanel = this.byId(newId),
					oldPanel = this.byId(oldId);
					oldPanel.setVisible(false);
					newPanel.setVisible(true);
			},

			onNavBack : function() {
				var sPreviousHash = history.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("master", {}, true);
				}
			},
			
			//Submits the data from the relevant form to be inserted into the database
			onSubmit : function(oEvent) {
				var src = oEvent.getSource(),
					sId = src.getId(),
					sPath,
					oData = {},
					oModel = this.getModel();
				switch (sId) {
					case "s1":
						sPath = "/Stats";
						break;
					case "s2":
						sPath = "/Games";
						break;
					case "s3":
						sPath = "/Players";
						break;
					case "s4":
						sPath = "/Teams";
						break;
					case "s5":
						sPath = "/Seasons";
						break;
				}
				//Back end needs to be opened up, before oData can be created 
				//oModel.create(sPath, oData);
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */



			//Method is called when the router navigates to this page, just acts as a placeholder
			_onAddMatched : function (oEvent) {
				return;
			}

		});

	}
);