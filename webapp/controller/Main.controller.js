sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	'sap/m/Token',
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Fragment, Filter, Token, FilterOperator) {
	"use strict";

	return Controller.extend("freestyle.zmrpa.v2.controller.Main", {
		onInit: function () {
			//const oModelPlantVH = new JSONModel("../model/PlantsVH.json");
			//this.getView().setModel(oModelPlantVH, "Plants");
			//const oModelMaterialVH = new JSONModel("../model/MaterialsVH.json");
			//this.getView().setModel(oModelMaterialVH, "Materials");
			//const oModelMRPVH = new JSONModel("../model/MRPVH.json");
			//this.getView().setModel(oModelMRPVH, "MRP");
		},

		onPressExecute: function () {
			const oModel = this.getView().getModel("AppData");
			const sPlant = this.byId("_IDInputPlant").getValue();
			oModel.Plant = sPlant;
			this.getView().setModel(oModel, "AppData");
			const oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("RouteData");
		},

		onValueHelpRequestPlant: function (oEvent) {
			if (!this._oValueHelpDialogPlant) {
				this._oValueHelpDialogPlant = new sap.m.SelectDialog({
					title: "Select Plant",
					search: this._onValueHelpDialogSearchPlant.bind(this),
					confirm: this._onValueHelpDialogClosePlant.bind(this),
					cancel: this._onValueHelpDialogClosePlant.bind(this)
				});
				//bind items from OData V4
				this._oValueHelpDialogPlant.bindAggregation("items", {
					path: "MainData>/ZCE_PLANTVH",  // replace with your entity
					parameters: { $select: "plant,name" },
					template: new sap.m.StandardListItem({
						title: "{MainData>plant}",
						description: "{MainData>name}"
					})
				});
				this.getView().addDependent(this._oValueHelpDialogPlant);
			}

			// Open ValueHelpDialog filtered by the input's value
			var sInputValue = oEvent.getSource().getValue();
			this._oValueHelpDialogPlant.getBinding("items").filter([new Filter("plant", FilterOperator.Contains, sInputValue)]);
			this._oValueHelpDialogPlant.open(sInputValue);
		},

		_onValueHelpDialogSearchPlant: function (oEvent) {
			let sValue = oEvent.getParameter("value");
			let oFilter = new Filter("plant", FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		_onValueHelpDialogClosePlant: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				let sTitle = oSelectedItem.getTitle();
				this.getView().byId("_IDInputPlant").setValue(sTitle);
			}
		},

		onValueHelpRequestMRP: function (oEvent) {
			if (!this._oValueHelpDialog) {
				this._oValueHelpDialogMRP = new sap.m.SelectDialog({
					title: "Select MRP",
					multiSelect: true,
					search: this._onValueHelpDialogSearchMRP.bind(this),
					confirm: this._onValueHelpDialogCloseMRP.bind(this),
					cancel: this._onValueHelpDialogCloseMRP.bind(this)
				});
				//bind items from OData V4
				this._oValueHelpDialogMRP.bindAggregation("items", {
					path: "MainData>/ZCE_MRPVH",  // replace with your entity
					parameters: { $select: "mrp,name" },
					template: new sap.m.StandardListItem({
						title: "{MainData>mrp}",
						description: "{MainData>name}"
					})
				});
				this.getView().addDependent(this._oValueHelpDialogMRP);
			}

			// Open ValueHelpDialog filtered by the input's value
			var sInputValue = oEvent.getSource().getValue();
			this._oValueHelpDialogMRP.getBinding("items").filter([new Filter("mrp", FilterOperator.Contains, sInputValue)]);
			this._oValueHelpDialogMRP.open(sInputValue);
		},

		_onValueHelpDialogSearchMRP: function (oEvent) {
			let sValue = oEvent.getParameter("value");
			let oFilter = new Filter("mrp", FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		_onValueHelpDialogCloseMRP: function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				oMultiInput = this.byId("_multiInputMRP");
			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						text: oItem.getTitle()
					}));
				});
			}
		},

		onValueHelpRequestMaterial: function (oEvent) {
			if (!this._oValueHelpDialog) {
				this._oValueHelpDialogMaterial = new sap.m.SelectDialog({
					title: "Select Material",
					multiSelect: true,
					search: this._onValueHelpDialogSearchMaterial.bind(this),
					confirm: this._onValueHelpDialogCloseMaterial.bind(this),
					cancel: this._onValueHelpDialogCloseMaterial.bind(this)
				});
				//bind items from OData V4
				this._oValueHelpDialogMaterial.bindAggregation("items", {
					path: "MainData>/ZCE_MATERIAL_VH",  // replace with your entity
					parameters: { $select: "ProductId,name" },
					template: new sap.m.StandardListItem({
						title: "{MainData>ProductId}",
						description: "{MainData>name}"
					})
				});
				this.getView().addDependent(this._oValueHelpDialogMaterial);
			}

			// Open ValueHelpDialog filtered by the input's value
			var sInputValue = oEvent.getSource().getValue();
			this._oValueHelpDialogMaterial.getBinding("items").filter([new Filter("ProductId", FilterOperator.Contains, sInputValue)]);
			this._oValueHelpDialogMaterial.open(sInputValue);
		},

		_onValueHelpDialogSearchMaterial: function (oEvent) {
			let sValue = oEvent.getParameter("value");
			let oFilter = new Filter("ProductId", FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		_onValueHelpDialogCloseMaterial: function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				oMultiInput = this.byId("_multiInputMaterial");
			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						text: oItem.getTitle()
					}));
				});
			}
		}
	});

});