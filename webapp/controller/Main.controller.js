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
			const oModelPlantVH = new JSONModel("../model/PlantsVH.json");
			this.getView().setModel(oModelPlantVH, "Plants");
			const oModelMaterialVH = new JSONModel("../model/MaterialsVH.json");
			this.getView().setModel(oModelMaterialVH, "Materials");
			const oModelMRPVH = new JSONModel("../model/MRPVH.json");
			this.getView().setModel(oModelMRPVH, "MRP");
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
			var sInputValue = oEvent.getSource().getValue(),
				oView = this.getView();
			if (!this._pVHDialogPlant) {
				this._pVHDialogPlant = Fragment.load({
					id: oView.getId(),
					name: "freestyle.zmrpa.v2.view.PlantValueHelp",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pVHDialogPlant.then(function (oDialog) {
				// Create a filter for the binding
				oDialog.getBinding("items").filter([new Filter("Plant", FilterOperator.Contains, sInputValue)]);
				// Open ValueHelpDialog filtered by the input's value
				oDialog.open(sInputValue);
			});
		},

		onValueHelpRequestMaterial: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue(),
				oView = this.getView();
			if (!this._pVHDialogMaterial) {
				this._pVHDialogMaterial = Fragment.load({
					id: oView.getId(),
					name: "freestyle.zmrpa.v2.view.MaterialValueHelp",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pVHDialogMaterial.then(function (oDialog) {
				// Create a filter for the binding
				oDialog.getBinding("items").filter([new Filter("ProductId", FilterOperator.Contains, sInputValue)]);
				// Open ValueHelpDialog filtered by the input's value
				oDialog.open(sInputValue);
			});
		},

		onValueHelpRequestMRP: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue(),
				oView = this.getView();
			if (!this._pVHDialogMRP) {
				this._pVHDialogMRP = Fragment.load({
					id: oView.getId(),
					name: "freestyle.zmrpa.v2.view.MRPValueHelp",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pVHDialogMRP.then(function (oDialog) {
				// Create a filter for the binding
				oDialog.getBinding("items").filter([new Filter("MRP", FilterOperator.Contains, sInputValue)]);
				// Open ValueHelpDialog filtered by the input's value
				oDialog.open(sInputValue);
			});
		},

		onValueHelpDialogSearchPlant: function (oEvent) {
			debugger;
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Plant", FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		onValueHelpDialogSearchMaterial: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilterName = new Filter("ProductId", FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilterName]);
		},

		onValueHelpDialogSearchMRP: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilterName = new Filter("MRP", FilterOperator.Contains, sValue);
			oEvent.getSource().getBinding("items").filter([oFilterName]);
		},

		onValueHelpDialogClosePlant: function (oEvent) {
			var sDescription,
				oSelectedItem = oEvent.getParameter("selectedItem");
			oEvent.getSource().getBinding("items").filter([]);
			if (!oSelectedItem) {
				return;
			}
			const sValue = oSelectedItem.getDescription();
			this.byId("_IDInputPlant").setSelectedKey(sValue);
		},

		onValueHelpDialogCloseMaterial: function (oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems"),
				oMultiInput = this.byId("_multiInputMaterial");
			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						text: oItem.getTitle()
					}));
				});
			}
		},

		onValueHelpDialogCloseMRP: function (oEvent) {
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

		onSuggestionItemSelectedPlant: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var oText = oItem ? oItem.getKey() : "";
		},
		onSuggestionItemSelectedMaterial: function (oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var oText = oItem ? oItem.getKey() : "";
		}
	});

});