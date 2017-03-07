/*global location */
sap.ui.define([
		"base/stats/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"base/stats/model/formatter",
		"sap/ui/core/format/NumberFormat"
	], function (BaseController, JSONModel, formatter, NumberFormat) {
		"use strict";

		return BaseController.extend("base.stats.controller.Add", {

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

				this.getRouter().getRoute("add").attachPatternMatched(this._onObjectMatched, this);

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


			
			onNewChange : function (oEvent) {
				var src = oEvent.getSource(),
					newId = src.getSelectedKey(),
					oldId = src.getLastItem().getKey(),
					newPanel = this.byId(newId),
					oldPanel = this.byId(oldId);
					oldPanel.setVisible(false);
					newPanel.setVisible(true);
			},

			/**
			 * Event handler  for navigating back.
			 * It there is a history entry we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the master route.
			 * @public
			 */
			onNavBack : function() {
				var sPreviousHash = history.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("master", {}, true);
				}
			},
			
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
				//oModel.create(sPath, oData);
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