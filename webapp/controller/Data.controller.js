sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
	'sap/m/MessageItem',
	'sap/m/MessageView',
	'sap/m/Bar',
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Link',
	'sap/ui/core/IconPool',
], (Controller, JSONModel, MessageToast, MessageItem, MessageView, Bar, Button, Dialog, Link, IconPool) => {
	"use strict";
	var oAppData = new JSONModel();

	var oLink = new Link({
		text: "Show more information",
		href: "http://sap.com",
		target: "_blank"
	});

	var oMessageTemplate = new MessageItem({
		type: '{messages>type}',
		title: '{messages>title}',
		description: '{messages>description}',
		subtitle: '{messages>subtitle}',
		counter: '{messages>counter}',
		groupName: '{messages>group}',
		link: oLink
	});

	return Controller.extend("freestyle.zmrpa.v2.controller.Data", {

		onInit: function () {
			//local data models
			this.JSONData = ["../model/data/Data1.json", "../model/data/Data2.json", "../model/data/Data3.json", "../model/data/Data4.json", "../model/data/Data5.json"];
			//load first json file
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteData").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			const oModel = new JSONModel();
			this.getView().setModel(oModel);
			this.removeMessageView();

			sap.ui.core.BusyIndicator.show();
			setTimeout(() => {

				//set index of first JSON file
				oAppData = this.getView().getModel("AppData");
				oAppData.index = 0;
				oAppData.materialCount = 0;
				oAppData.matlist = [];

				//Get Storage object to use
				const oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
				//Get data from Storage
				const localdata = oStorage.get("myLocalData");
				if (localdata) {
					//Set data into Storage
					oStorage.put("myLocalData", oAppData);
				}

				var oData = this.getView().getModel("MainData");
				var oOperation = oData.bindContext("/ZCE_MRPA_FS/com.sap.gateway.srvd_a2x.zsd_mrpa_fs.v0001.getMRPData(...)");
				//Success function to display success messages from OData Operation
				var fnSuccess = function () {
					debugger;
					var oResults = oOperation.getBoundContext().getObject();
					if (oResults.value.length > 0) {
						this.getView().setModel(new JSONModel(oResults.value));
						const oTreeTable = this.byId("TreeTable");
						oTreeTable.expandToLevel(1);
						oAppData.matlist = oResults.value[0].matlist;
						oAppData.materialCount = oAppData.matlist.length;
						this.byId("_IDGenPreviousMaterial").setEnabled(false);
						if (oAppData.materialCount > 1) {
							this.byId("_IDGenNextMaterial").setEnabled(true);
						}
						sap.ui.core.BusyIndicator.hide();
					}
				}.bind(this);
				//Error function to display error messages from OData Operation
				var fnError = function (oError) {
					debugger;
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				if (oAppData.Plant !== null) {
					oOperation.setParameter("plant", oAppData.Plant);
					oOperation.setParameter("region", oAppData.Region);
					oOperation.setParameter("material", "");
					oOperation.setParameter("matrange", oAppData.Material)
					oOperation.setParameter("mrprange", oAppData.MRP);
				}
				// Execute OData V4 operation i.e a static action to upload the file
				oOperation.invoke().then(fnSuccess, fnError)

				var oMessage = new JSONModel();
				oMessage.setData([]);
				this.getView().setModel(oMessage, "messages");
			}, "3000");

		},

		onCollapseAll: function () {
			const oTreeTable = this.byId("TreeTable");
			oTreeTable.collapseAll();
		},

		onExpandFirstLevel: function () {
			const oTreeTable = this.byId("TreeTable");
			oTreeTable.expandToLevel(2);
		},

		onExport: function () {
			var jsonData = this.getView().getModel().getData().material_by_mrp_and_customer.data;
			this.JSONToCSVConvertor(jsonData);
		},

		onSave: function () {

			var oData = this.getView().getModel("MainData");
			var oOperation = oData.bindContext("/ZCE_MRPA_FS/com.sap.gateway.srvd_a2x.zsd_mrpa_fs.v0001.saveMRPData(...)");
			//Success function to display success messages from OData Operation
			var fnSuccess = function () {
				var oResults = oOperation.getBoundContext().getObject();
				debugger;
			}.bind(this);
			//Error function to display error messages from OData Operation
			var fnError = function (oError) {
				debugger;
			}.bind(this);

			var oTreeTableData = this.getView().getModel().getData();
			var data = oTreeTableData[0];
			oOperation.setParameter("name", data.name);
			oOperation.setParameter("openDelivery", data.openDelivery);
			oOperation.setParameter("boQty", data.boQty);
			oOperation.setParameter("currentUNR", data.currentUNR);
			oOperation.setParameter("currentQA", data.currentQA);
			oOperation.setParameter("currentBlock", data.currentBlock);
			oOperation.setParameter("currentAvailable", data.currentAvailable);
			oOperation.setParameter("matlist", []);
			oOperation.setParameter("data", data.data);
			debugger;
			// Execute OData V4 operation i.e a static action to upload the file
			oOperation.invoke().then(fnSuccess, fnError)

			sap.ui.core.BusyIndicator.show();
			setTimeout(() => {
				// create any data and a model and set it to the view
				var that = this;
				var sErrorDescription = 'More details of the error. \n' +
					'More lines';

				var aMockMessages = [{
					type: 'Error',
					title: 'Column for ON-HAND quantity is not balanced SUM = 1- .',
					description: sErrorDescription,
					subtitle: '',
					group: "On hand"
				}, {
					type: 'Error',
					title: 'SUM( AVL_QTY = 0 ,INP_QTY = 1- ) < 0 !!! Column = May , All customers',
					description: sErrorDescription,
					subtitle: '',
					group: "Available"
				}, {
					type: 'Error',
					title: 'Technical message without object relation',
					description: sErrorDescription,
					group: "General"
				}, {
					type: 'Success',
					title: 'Sample success message',
					description: null,
					group: "General"
				}];

				var oModel = new JSONModel();
				oModel.setData(aMockMessages);
				this.getView().setModel(oModel, "messages");

				var oBackButton = new Button({
					icon: IconPool.getIconURI("nav-back"),
					visible: false,
					press: function () {
						that.oMessageView.navigateBack();
						this.setVisible(false);
					}
				});

				this.oMessageView = new MessageView({
					showDetailsPageHeader: false,
					itemSelect: function () {
						oBackButton.setVisible(true);
					},
					items: {
						path: 'messages>/',
						template: oMessageTemplate
					},
					groupItems: true
				});

				this.getView().addDependent(this.oMessageView);
				this.oDialog = new Dialog({
					content: this.oMessageView,
					contentHeight: "50%",
					contentWidth: "50%",
					endButton: new Button({
						text: "Close",
						press: function () {
							this.getParent().close();
						}
					}),
					customHeader: new Bar({
						contentLeft: [oBackButton],
						contentMiddle: [
							new Text({ text: "Publish order" })
						]
					}),
					verticalScrolling: false
				});
				this.oMessageView.navigateBack();
				this.oDialog.open();
				sap.ui.core.BusyIndicator.hide();
			}, "2000");

		},

		onChangeMRP: function (oEvent) {
			const sSpath = oEvent.getSource().getBindingContext().getPath();
			const aPathSplit = sSpath.split("/");
			if (aPathSplit.length > 0) {
				const sRowMRP = aPathSplit[3];
				const oMRP = this.getView().getModel().oData[0].data[sRowMRP];
				//change the values at customer level
				if (oMRP.data.length > 0) {
					const aCustomer = oMRP.data;
					const sEachCustomer = (Number(oMRP.newUNR) + Number(oMRP.newBlock) + Number(oMRP.newQA)) / aCustomer.length;
					for (let i = 0; i < aCustomer.length; i++) {
						aCustomer[i].newAvailable = sEachCustomer.toString();
					}
					oEvent.getSource().getParent().expand();
				}
			}
		},

		onChangeNewAvailable: function (oEvent) {
			debugger;
			const sSpath = oEvent.getSource().getBindingContext().getPath();
			const aPathSplit = sSpath.split("/");
			if (aPathSplit.length > 0) {
				const sRowMRP = aPathSplit[3];
				const oMRP = this.getView().getModel().oData[0].data[sRowMRP];
				//sum the values at customer level and append to MRP area level
				if (oMRP.data.length > 0) {
					const aCustomer = oMRP.data;
					var totalCustomer = 0;
					for (let i = 0; i < aCustomer.length; i++) {
						totalCustomer = Number(totalCustomer) + Number(aCustomer[i].newAvailable)
					}
					this.getView().getModel().oData[0].data[sRowMRP].newUNR = totalCustomer.toString();
				}
			}
		},

		onNextMaterial: function () {
			sap.ui.core.BusyIndicator.show();
			/*setTimeout(() => {
				this.removeMessageView();
				oAppData.index++;
				if (oAppData.index > 0) {
					this.byId("_IDGenPreviousMaterial").setEnabled(true);
				}
				if (oAppData.index === 4) {
					this.byId("_IDGenNextMaterial").setEnabled(false);
				}
				sap.ui.core.BusyIndicator.hide();
				const oModel = new JSONModel(this.JSONData[oAppData.index]);
				this.getView().setModel(oModel);
				const oTreeTable = this.byId("TreeTable");
				oTreeTable.expandToLevel(1);
			}, "2000"); */

			setTimeout(() => {
				this.removeMessageView();
				oAppData.index++;
				if (oAppData.index > 0) {
					this.byId("_IDGenPreviousMaterial").setEnabled(true);
				}
				if (oAppData.index === (oAppData.materialCount - 1)) {
					this.byId("_IDGenNextMaterial").setEnabled(false);
				}

				var oData = this.getView().getModel("MainData");
				var oOperation = oData.bindContext("/ZCE_MRPA_FS/com.sap.gateway.srvd_a2x.zsd_mrpa_fs.v0001.getMRPData(...)");
				//Success function to display success messages from OData Operation
				var fnSuccess = function () {
					debugger;
					var oResults = oOperation.getBoundContext().getObject();
					if (oResults.value.length > 0) {
						this.getView().setModel(new JSONModel(oResults.value));
						const oTreeTable = this.byId("TreeTable");
						oTreeTable.expandToLevel(1);
					}
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);
				//Error function to display error messages from OData Operation
				var fnError = function (oError) {
					debugger;
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				oOperation.setParameter("plant", oAppData.Plant);
				oOperation.setParameter("region", oAppData.Region);
				oOperation.setParameter("material", oAppData.matlist[oAppData.index].material);
				oOperation.setParameter("matrange", [])
				oOperation.setParameter("mrprange", oAppData.MRP);
				// Execute OData V4 operation i.e a static action to upload the file
				oOperation.invoke().then(fnSuccess, fnError)
			}, "3000");

		},

		onPreviousMaterial: function () {
			sap.ui.core.BusyIndicator.show();
			/*setTimeout(() => {
				this.removeMessageView();
				oAppData.index--;
				if (oAppData.index === 0) {
					this.byId("_IDGenPreviousMaterial").setEnabled(false);
				}
				if (oAppData.index < 4) {
					this.byId("_IDGenNextMaterial").setEnabled(true);
				}

				sap.ui.core.BusyIndicator.hide();

				const oModel = new JSONModel(this.JSONData[oAppData.index]);
				this.getView().setModel(oModel);
				const oTreeTable = this.byId("TreeTable");
				oTreeTable.expandToLevel(1);
			}, "2000"); */
			setTimeout(() => {
				this.removeMessageView();
				oAppData.index--;
				if (oAppData.index === 0) {
					this.byId("_IDGenPreviousMaterial").setEnabled(false);
				}
				if (oAppData.index < (oAppData.materialCount - 1)) {
					this.byId("_IDGenNextMaterial").setEnabled(true);
				}

				var oData = this.getView().getModel("MainData");
				var oOperation = oData.bindContext("/ZCE_MRPA_FS/com.sap.gateway.srvd_a2x.zsd_mrpa_fs.v0001.getMRPData(...)");
				//Success function to display success messages from OData Operation
				var fnSuccess = function () {
					debugger;
					var oResults = oOperation.getBoundContext().getObject();
					if (oResults.value.length > 0) {
						this.getView().setModel(new JSONModel(oResults.value));
						const oTreeTable = this.byId("TreeTable");
						oTreeTable.expandToLevel(1);
					}
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);
				//Error function to display error messages from OData Operation
				var fnError = function (oError) {
					debugger;
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				oOperation.setParameter("plant", oAppData.Plant);
				oOperation.setParameter("region", oAppData.Region);
				oOperation.setParameter("material", oAppData.matlist[oAppData.index].material);
				oOperation.setParameter("matrange", [])
				oOperation.setParameter("mrprange", oAppData.MRP);
				// Execute OData V4 operation i.e a static action to upload the file
				oOperation.invoke().then(fnSuccess, fnError)
			}, "3000");
		},

		onRefresh: function () {
			this.removeMessageView();
			sap.ui.core.BusyIndicator.show();
			setTimeout(() => {
				var oData = this.getView().getModel("MainData");
				var oOperation = oData.bindContext("/ZCE_MRPA_FS/com.sap.gateway.srvd_a2x.zsd_mrpa_fs.v0001.getMRPData(...)");
				//Success function to display success messages from OData Operation
				var fnSuccess = function () {
					debugger;
					var oResults = oOperation.getBoundContext().getObject();
					if (oResults.value.length > 0) {
						this.getView().setModel(new JSONModel(oResults.value));
						const oTreeTable = this.byId("TreeTable");
						oTreeTable.expandToLevel(1);
					}
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);
				//Error function to display error messages from OData Operation
				var fnError = function (oError) {
					debugger;
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				oOperation.setParameter("plant", oAppData.Plant);
				oOperation.setParameter("region", oAppData.Region);
				oOperation.setParameter("material", oAppData.matlist[oAppData.index].material);
				oOperation.setParameter("matrange", [])
				oOperation.setParameter("mrprange", oAppData.MRP);
				// Execute OData V4 operation i.e a static action to upload the file
				oOperation.invoke().then(fnSuccess, fnError)
				sap.ui.core.BusyIndicator.hide();
			}, "2000");
		},

		// Display the button type according to the message with the highest severity
		// The priority of the message types are as follows: Error > Warning > Success > Info
		buttonTypeFormatter: function () {
			var sHighestSeverityIcon;
			var aMessages = this.getView().getModel("messages").oData;
			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sHighestSeverityIcon = "Negative";
						break;
					case "Warning":
						sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" ? "Critical" : sHighestSeverityIcon;
						break;
					case "Success":
						sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" && sHighestSeverityIcon !== "Critical" ? "Success" : sHighestSeverityIcon;
						break;
					default:
						sHighestSeverityIcon = !sHighestSeverityIcon ? "Neutral" : sHighestSeverityIcon;
						break;
				}
			});
			return sHighestSeverityIcon;
		},

		// Display the number of messages with the highest severity
		highestSeverityMessages: function () {
			var sHighestSeverityIconType = this.buttonTypeFormatter();
			var sHighestSeverityMessageType;
			switch (sHighestSeverityIconType) {
				case "Negative":
					sHighestSeverityMessageType = "Error";
					break;
				case "Critical":
					sHighestSeverityMessageType = "Warning";
					break;
				case "Success":
					sHighestSeverityMessageType = "Success";
					break;
				default:
					sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
					break;
			}

			return this.getView().getModel("messages").oData.reduce(function (iNumberOfMessages, oMessageItem) {
				return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
			}, 0);
		},

		// Set the button icon according to the message with the highest severity
		buttonIconFormatter: function () {
			var sIcon;
			var aMessages = this.getView().getModel("messages").oData;
			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sIcon = "sap-icon://message-error";
						break;
					case "Warning":
						sIcon = sIcon !== "sap-icon://message-error" ? "sap-icon://message-warning" : sIcon;
						break;
					case "Success":
						sIcon = sIcon !== "sap-icon://message-error" && sIcon !== "sap-icon://message-warning" ? "sap-icon://message-success" : sIcon;
						break;
					default:
						sIcon = !sIcon ? "sap-icon://message-information" : sIcon;
						break;
				}
			});

			return sIcon;
		},

		handleMessageViewPress: function (oEvent) {
			this.oMessageView.navigateBack();
			this.oDialog.open();
		},

		removeMessageView: function () {
			//remove message view
			if (this.oMessageView) {
				var oMessage = new JSONModel();
				oMessage.setData([]);
				this.getView().setModel(oMessage, "messages");
				this.getView().removeDependent(this.oMessageView);
			}
		},

		JSONToCSVConvertor: function (JSONData) {
			var arrData = JSONData;
			var CSV = '';
			var row = ""; // To add Table column header in excel
			var row1 = "";
			var table = this.getView().byId("TreeTable");

			table.getColumns().forEach(function (column) {
				row1 += '"' + column.getLabel().getText() + '",';
			});
			CSV += row1 + '\r\n';//Row that will create Header Columns

			var column = {
				"name": "name",
				"openDelivery": "orderType",
				"status": "status",
				"amount": "amount",
				"orderBy": "orderBy",
				"orderDate": "orderDate"
			};
			var i, j, k;

			var createRow = function (level) {

				if (level === "Parent") {
					row += '"' + arrData[i][column.name] + '",';
					CSV += row + "\r\n";
				} else if (level === "Child") {
					row = ",";
					row += '"' + arrData[i].data[j][column.orderType] + '",';
					CSV += row + "\r\n";
				} else {
					row = ",";
					row += ",";
					row += '"' + arrData[i].data[j].data[k][column.orderDate] +
						'","' + arrData[i].data[j].data[k][column.amount] +
						'","' + arrData[i].data[j].data[k][column.orderBy] +
						'","' + arrData[i].data[j].data[k][column.status] +
						'",';
					CSV += row + "\r\n";
				}
			};

			//loop is to extract each row 
			for (i = 0; i < arrData.length; i++) {
				createRow("Parent");
				if (arrData[i].data.length > 0) {
					for (j = 0; j < arrData[i].data.length; j++) {
						createRow("Child");
						if (arrData[i].data[j].data.length > 0) {
							for (k = 0; k < arrData[i].data[j].data.length; k++) {
								createRow("Children");
							}
						}
					}
				}
			}

			if (CSV === '') {
				sap.m.MessageToast.show("Invalid data");
				return;
			}
			// Generate a file name 
			var fileName = "MyReport_";
			var blob = new Blob([CSV], {
				type: "text/csv;charset=utf-8;"
			});

			if (sap.ui.Device.browser.name === "ie") { // IE 10+ 
				navigator.msSaveBlob(blob, "csvname.csv");
			} else {
				var uri = 'data:application/csv;charset=utf-8,' + escape(CSV);
				var link = document.createElement("a");
				link.href = uri;
				link.style = "visibility:hidden";
				link.download = fileName + ".csv";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		},
	});
});