/*global history */
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History"
	], function (Controller, History) {
		"use strict";

		return Controller.extend("base.stats.controller.BaseController", {
			/**
			 * Convenience method for accessing the router in every controller of the application.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter : function () {
				return this.getOwnerComponent().getRouter();
			},

			/**
			 * Convenience method for getting the view model by name in every controller of the application.
			 * @public
			 * @param {string} sName the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model in every controller of the application.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			/**
			 * Convenience method for getting the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			
			//List factory for player list items
			playerListFactory : function (sId, oContext) {
				var oPlayer = oContext.getObject(oContext.getPath()),
					sFirst = oPlayer.fname,
					sLast = oPlayer.lname,
					item  =  new sap.m.ObjectListItem();
				return item.setTitle(sFirst + " " + sLast);
			},
			
			//List factory for game list items
			gameListFactory : function (sId, oContext){
				var oGame = oContext.getObject(oContext.getPath()),
					sHome = oContext.getObject("/" + oGame.Home.__ref).teamalias,
					sAway = oContext.getObject("/" + oGame.Away.__ref).teamalias,
					sNum = oGame.gameno,
					item  =  new sap.m.ObjectListItem();
				return item.setTitle("Game " + sNum).addAttribute(new sap.m.ObjectAttribute(sId).setText(sAway + " vs " + sHome));
			},
			
			//Calculates total/average stats based on those present in the table at the time
			//also updates the counter 
			onListUpdateFinished : function (oEvent) {
				var sTitle,
					iTotalItems = oEvent.getParameter("total"),
					oViewModel = this.getModel("detailView"),
					oTable = this.byId("lineItemsList"),
					aItems = oTable.getItems(),
					aTotals = new Array(13).fill(0),
					totalRow = new sap.m.ColumnListItem();

				//collects the data present in the cells 
				for(var i = 0; i < aItems.length; i++){
					var item = aItems[i],
						cells = item.getCells();
						for( var j = 1; j < aTotals.length + 1 ; j++){
							var cell = cells[j];
							aTotals[j-1] += parseInt(cell.getNumber());
						}
				}
				//adds the total data to the bottom of the table
				totalRow.addCell(new sap.m.ObjectIdentifier().setText("Total"));
				for(var i = 0 ; i < aTotals.length; i++){
					totalRow.addCell(new sap.m.ObjectNumber().setNumber(aTotals[i]));
				}
				totalRow.addCell(new sap.m.ObjectNumber().setNumber(this._battingAverage(aTotals)));
				totalRow.addCell(new sap.m.ObjectNumber().setNumber(this._onBasePercentage(aTotals)));
				totalRow.addCell(new sap.m.ObjectNumber().setNumber(this._slugging(aTotals)));
				totalRow.addCell(new sap.m.ObjectNumber().setNumber(this._ops(aTotals)));
				oTable.addItem(totalRow);
				
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
			},
			
			onLeader : function() {
				this.getRouter().navTo("leader", {}, true);	
			},
			
			onAdd : function () {
				this.getRouter().navTo("add", {}, true);	
			},
			
			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */
			
			//Following 4 methods calculate batting stats
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
			}

		});

	}
);