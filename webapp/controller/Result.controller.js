sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"../model/formatter"
], function (Controller, BaseController, formatter) {
	"use strict";

	return BaseController.extend("dinosol.din-colecciones-tiecol.controller.Result", {

		formatter: formatter,

		onInit: function () {

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("RouteResult").attachPatternMatched(this._onDetailMatched, this);
			// this.getTiendas();
			// this.setComponentModelProperty("data", "/articulos", this.getComponentModelProperty("mockdata", "/rows"));
		},

		_onDetailMatched: function (oEvent) {

			this.getView().setModel(new sap.ui.model.json.JSONModel({
				"dummy": "",
				"openSH": false
			}), "viewModel");
			jQuery.sap.delayedCall(200, this, function () {
				this.loadTiendas();
				this.clearFilters();
			});
			document.addEventListener("keypress", this.onKeyPressGeneral.bind(this));
		},

		getMainTable: function () {

			return this.getView().byId("tableResult");
		},

		getOpenSH: function () {

			return this.getViewModel().getProperty("/openSH");
		},

		onKeyPressGeneral: function (e) {
			if (e.which === 13) {
				this.getView().byId("mainFilterBar").fireSearch();
			}
		},

		toggleOpenSH: function () {

			var bOpen = this.getView().getModel("viewModel").getProperty("/openSH");
			this.getView().getModel("viewModel").setProperty("/openSH", !bOpen);
		},

		getVisibleColumns: function () {

			return this.getComponentModelProperty("columns", "/visibility").filter(function (oCol) {
				return oCol.visible === true;
			}).map(function (oVisible) {
				return oVisible.field;
			});
		},

		onPressGroupTable: function () {

			if (!this.getView().agruparDialog) {
				this.getView().agruparDialog = sap.ui.xmlfragment("dialogAgrupar",
					"dinosol.din-colecciones-tiecol.fragment.DialogGroupTable", this);
				this.getView().addDependent(this.getView().agruparDialog);
			}
			this.getView().agruparDialog.open();
		},

		agrupar: function (oEvent) {

			var oSorter = undefined;
			if (oEvent.getParameter("groupItem")) {

				var sKey = oEvent.getParameter("groupItem").getBindingContext("columns").getProperty("field");
				if (!!sKey) {
					oSorter = new sap.ui.model.Sorter({
						path: sKey,
						group: function (oContext) {
							return oContext.getProperty("Descripcion" + sKey) + " (" + oContext.getProperty(sKey) + ")"
						}
					});
				}
			}
			this.getMainTable().getBinding("items").sort(oSorter);
		},

		onPressSearch: function (oEvent) {

			if (this.getOpenSH()) {
				return;
			}
			this.searchArticulos();
		},

		getDateToSearch: function (dDate) {

			var fnTwoDigits = function (iNumber) {
				return iNumber < 10 ? "0" + iNumber : "" + iNumber;
			};
			return dDate.getFullYear() + fnTwoDigits(dDate.getMonth() + 1) + fnTwoDigits(dDate.getDate());
		},

		onPressPersoTable: function (oEvent) {

			if (!this.getView().persoTableDialog) {
				this.getView().persoTableDialog = sap.ui.xmlfragment("persoTableDialog",
					"dinosol.din-colecciones-tiecol.fragment.DialogPersoTable", this);
				this.getView().addDependent(this.getView().persoTableDialog);
			}
			this.getView().persoTableDialog.open();

		},

		onChangeColumnsItems: function (oEvent) {

		},

		onOKPersoTable: function (oEvent) {

			if (oEvent.getParameter("payload").columns.tableItemsChanged) {
				this.fireVisibilityColumnsChange(oEvent.getParameter("payload").columns.selectedItems);
				// this.setComponentModelProperty("columns", "/visibility", oEvent.getParameter("payload").columns.tableItems);
			}
		},

		afterOpenPersoTable: function () {
			return;
			this.getComponentModel("columns").updateBindings(true);
		},

		fireVisibilityColumnsChange: function (aSelectedItems) {

			var aVisibility = this.getComponentModelProperty("columns", "/data");
			var aSelectedTexts = aSelectedItems.map(function (oSel) {
				return oSel.columnKey;
			});
			this.getMainTable().getColumns().forEach(function (oColumn, iIndex) {
				var sFieldBinding = oColumn.getBindingContext("columns").getProperty("field");
				var bSetVisible = aSelectedTexts.includes(sFieldBinding);
				oColumn.setVisible(bSetVisible);
				aVisibility[iIndex].visible = bSetVisible;
			}, this);
			this.getView().persoTableDialog.close();
		},

		onCancelPersoTable: function () {

			this.getView().persoTableDialog.close();
			this.getView().persoTableDialog.destroy();
			this.getView().persoTableDialog = undefined;
		},

		getFiltersToSearch: function () {

			var oBar = this.getView().byId("mainFilterBar");
			var aSelectionSet = oBar.getFilterGroupItems().map(function (oFGI) {
				return oFGI.getControl();
			});
			var that = this;
			return aSelectionSet.reduce(function (aResult, oControl) {
				var sValue;
				if (oControl.getTokens) {
					oControl.getTokens().forEach(function (oToken) {
						aResult.push(new sap.ui.model.Filter({
							path: oControl.getName(),
							operator: sap.ui.model.FilterOperator.EQ,
							value1: oToken.getKey(),
						}));
					});
				} else if (oControl.getSecondDateValue) {
					var dDate = that.getDateToSearch(oControl.getDateValue());
					var dSecondDate = that.getDateToSearch(oControl.getSecondDateValue());
					aResult.push(new sap.ui.model.Filter({
						path: oControl.getName(),
						operator: sap.ui.model.FilterOperator.BT,
						value1: dDate,
						value2: dSecondDate
					}));
				} else if (oControl.getDateValue) {
					var dDate = that.getDateToSearch(oControl.getDateValue());
					aResult.push(new sap.ui.model.Filter({
						path: oControl.getName(),
						operator: sap.ui.model.FilterOperator.EQ,
						value1: dDate,
					}));
				} else if (oControl.getValue) {
					var sOp = sap.ui.model.FilterOperator.Contains;
					if (oControl.getValue()) {
						sValue = oControl.getValue();
						if (sValue.indexOf("*") === 0) {
							sOp = sap.ui.model.FilterOperator.EndsWith;
						}
						if (sValue.indexOf("*") > 0) {
							sOp = sap.ui.model.FilterOperator.StartsWith;
						}
						sValue = sValue.replace(/\*/g, "");
						aResult.push(
							new sap.ui.model.Filter({
								path: oControl.getName(),
								operator: sOp,
								value1: sValue
							}));
					}
				}
				if (oControl.getSelected) {
					if (oControl.getSelected()) {
						aResult.push(new sap.ui.model.Filter({
							path: oControl.getName(),
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "X"
						}));
					}
				}
				if (oControl.getItems) {
					oControl.getSelectedKeys().forEach(function (sKey) {
						aResult.push(new sap.ui.model.Filter({
							path: oControl.getName(),
							operator: sap.ui.model.FilterOperator.EQ,
							value1: sKey,
						}));
					});
				}
				return aResult;
			}, []);
		},

		searchArticulos: function () {

			var that = this;
			var aFilters = this.getFiltersToSearch();

			if (aFilters.length === 0) {
				return; //new sap.m.MessageToast.show("Utilice los filtros para efectuar una búsqueda");
			}
			sap.ui.core.BusyIndicator.show(0);
			this.getComponentModel().read("/ReportTiendaColeccionSet", {
				filters: aFilters,
				success: function (oData) {
					if (oData.results) {
						if (oData.results.length === 0) {
							sap.m.MessageToast.show("No se han recuperado artículos");
						}
						that.setComponentModelProperty("data", "/articulos", oData.results);
						// that.getMainTable().bindRows("data>/validaciones");
						that.getOwnerComponent().getModel("data").updateBindings(true);
						sap.ui.core.BusyIndicator.hide();
					}
				},
				error: function (oData) {
					sap.ui.core.BusyIndicator.hide();
					return sap.m.MessageToast.show("Ha fallado la recuperación de artículos");
				}
			});

		},

		clearFilters: function () {

			var oInitSearch = {
				"Modulo": [],
				"Surtido": [],
				"Tienda": []
			};
			this.setComponentModelProperty("search", "/", oInitSearch);
			this.getView().byId("mainFilterBar").getAllFilterItems().forEach(function (oItem) {
				if (oItem.getControl().fireChange) {
					oItem.getControl().fireChange();
				}
			}, this);
		},

		onPressClear: function (oEvent) {

			this.getView().byId("mainFilterBar").getAllFilterItems().forEach(function (oItem, index) {
				var oContent = oItem.getControl();
				if (oContent.getValue) {
					oContent.setValue("");
				}
				if (oContent.getItems) {
					oContent.removeAllSelectedItems();
				}
			});
			this.clearFilters();
		},

		getTiendas: function () {

			var that = this;
			this.getComponentModel().read("/MCTiendaSet", {
				success: function (oData) {
					jQuery.sap.delayedCall(200, this, function () {
						that.getComponentModel("tiendas").setProperty("/", oData.results);
					});
				},
				error: function (oData) {}
			});
		},

		onRequestValueHelpTienda: function () {

			var that = this;
			if (!this.getView().selectDialogTienda) {

				this.getView().selectDialogTienda = new sap.m.SelectDialog({
					title: "{i18n>title.tiendas}",
					search: [that.onSearchSelectDialogTienda, that],
					confirm: [that.onConfirmSelectDialogTienda, that],
					multiSelect: true,
					items: {
						path: "tiendas>/",
						template: new sap.m.StandardListItem({
							title: "{tiendas>Tienda}",
							description: "{tiendas>Descripcion}",
							iconDensityAware: false,
							iconInset: false,
							type: "Active"
						})
					}
				});
				this.getView().addDependent(this.getView().selectDialogTienda);
			}
			this.getView().selectDialogTienda.open();
		},

		onSearchSelectDialogTienda: function (oEvent) {

			this.getView().selectDialogTienda.getBinding("items").filter(undefined);
			this.getView().selectDialogTienda.getBinding("items").filter([new sap.ui.model.Filter({
				path: "Descripcion",
				operator: "Contains",
				value1: oEvent.getParameter("value")
			})]);
		},

		onConfirmSelectDialogTienda: function (oEvent) {

			var aKeys = oEvent.getParameter("selectedItems").map(function (oItem) {
				return {
					"Tienda": oItem.getBindingContext("tiendas").getProperty("Tienda")
				};
			});
			this.setComponentModelProperty("search", "/Tienda", aKeys);
			this.getComponentModel("search").updateBindings(true);
		},

		onChangeFechaInicio: function (oEvent) {

			var dValueInicio = oEvent.getParameter("from") || this.getComponentModelProperty("search", "/dateInicio"),
				dSecondValueInicio = oEvent.getParameter("to") || this.getComponentModelProperty("search", "/secondDateInicio");
			oEvent.getSource().setDateValue(dValueInicio);
			oEvent.getSource().setSecondDateValue(dSecondValueInicio);
		},

		parseDateDownload: function (sDate) {

			// Esperamos aaaaMMdd
			if (sDate) {
				var sDay = parseInt(sDate.substring(6, 8)),
					sMes = parseInt(sDate.substring(4, 6)),
					sAno = parseInt(sDate.substring(0, 4));

				sDay = sDay < 10 ? "0" + sDay : "" + sDay;
				sMes = sMes < 10 ? "0" + sMes : "" + sMes;
				return sAno === 0 ? "" : sDay + "/" + sMes + "/" + sAno;
			}
			return "";

		},

		onPressDescargar: function () {

			var aFinalOrdenTextos = this.getComponentModelProperty("columns_download", "/data").map(function (oCol) {
				return oCol.text;
			}).filter(function (sText) {
				return sText !== "";
			});

			var oColsFieldText = {};
			this.getComponentModelProperty("columns_download", "/data").forEach(function (oCol) {
				var sText = oCol.text;
				if (sText !== "") {
					oColsFieldText[oCol.field] = oCol.text;
				}
			}, this);

			var aArticulos = this.getComponentModelProperty("data", "/articulos");
			var aColumns = this.getComponentModelProperty("columns_download", "/data");
			aArticulos = aArticulos.map(function (oData) {
				delete oData.Mensaje;
				delete oData.__metadata;
				var oNew = {};
				for (var sProp in oData) {
					var sValue;
					if (sProp in oColsFieldText) {
						sValue = oData[sProp];
						oNew[oColsFieldText[sProp]] = sProp.indexOf("Fecha") >= 0 ? this.parseDateDownload(sValue) : sValue;
					}
				}
				return oNew;
			}, this);

			/* make the worksheet */
			var ws = XLSX.utils.json_to_sheet(aArticulos, {
				header: aFinalOrdenTextos
			});

			/* add to workbook */
			var wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "ARTICULOS");

			XLSX.writeFile(wb, "Articulos.xlsx");

		},

		onPressIconSemaforoGeneral: function (oEvent) {

			var sMessage = oEvent.getSource().getBindingContext("data").getProperty("Message");

			if (!this.getView().errorDialog) {

				this.getView().errorDialog = new sap.m.ResponsivePopover({
					contentHeight: "50px",
					contentWidth: "400px",
					showArrow: false,
					showHeader: false,
					title: "Errores",
					placement: "Right",
					content: [
						new sap.m.MessageView({
							height: "50px",
							width: "400px",
							items: [
								new sap.m.MessageItem({
									title: "Titulo error: ", // + sMessage,
									type: "Error",
									// description: "Description"
								})
							]
						}).addStyleClass("errorsMessageView")
					]
				});
				this.getView().addDependent(this.getView().errorDialog);
			}
			this.getView().errorDialog.openBy(oEvent.getSource());
		},

		onChangeMulti: function (oEvent) {

			var sValue = oEvent.getParameter("value");
			if (sValue) {

				var sField = oEvent.getSource().getBindingInfo("tokens").path.replace("/", "");
				var oNew = {};
				oNew[sField] = sValue;
				oEvent.getSource().setValue("");
				var aTokens = this.getComponentModelProperty("search", "/" + sField);

				var bExists = aTokens.some(function (oTok) {
					return oTok[sField] === sValue;
				}, this);
				if (!bExists) {
					aTokens.push(oNew);
					this.setComponentModelProperty("search", "/" + sField, aTokens);
				}
			}

		},

		onTokenUpdate: function (oEvent) {

			if (oEvent.getParameter("type") === "removed") {

				var aKeysRemoved = oEvent.getParameter("removedTokens").map(function (oToken) {
					return oToken.getKey();
				});
				var sField = oEvent.getSource().getBindingInfo("tokens").path.replace("/", "");
				var aTokens = this.getComponentModelProperty("search", "/" + sField);

				aTokens = aTokens.filter(function (oItem) {
					return !aKeysRemoved.includes(oItem[sField]);
				}, this);
				this.setComponentModelProperty("search", "/" + sField, aTokens);
			}

		},

		getFilterBarControls: function (sDialog) {

			var oDialog;
			switch (sDialog) {
			case "articulo":
				{
					oDialog = this.getView().searchHelpArticuloDialog;
					break;
				}
			case "coleccion":
				{
					oDialog = this.getView().searchHelpColeccionDialog;
					break;
				}
			case "modulo":
				{
					oDialog = this.getView().searchHelpModuloDialog;
					break;
				}
			case "surtido":
				{
					oDialog = this.getView().searchHelpSurtidoDialog;
					break;
				}
			case "proveedor":
				{
					oDialog = this.getView().searchHelpProveedorDialog;
					break;
				}
			case "jerarquia":
				{
					oDialog = this.getView().searchHelpJerarquiaDialog;
					break;
				}
			case "familia":
				{
					oDialog = this.getView().searchHelpFamiliaDialog;
					break;
				}
			case "sector":
				{
					oDialog = this.getView().searchHelpSectorDialog;
					break;
				}
			case "seccion":
				{
					oDialog = this.getView().searchHelpSeccionDialog;
					break;
				}
			case "subfamilia":
				{
					oDialog = this.getView().searchHelpSubfamiliaDialog;
					break;
				}

			}
			var oBar = oDialog.getFilterBar();
			return oBar.getFilterGroupItems().map(function (oFGI) {
				return oFGI.getControl();
			});
		},

		onKeyPressArticuloSH: function (e) {
			if (e.which === 13) {
				this.getView().searchHelpArticuloDialog.getFilterBar().fireSearch();
			}
		},

		closeValueHelpDialogArticulo: function () {

			this.getView().searchHelpArticuloDialog.close();
			this.toggleOpenSH();
			document.removeEventListener("keypress", this.onKeyPressArticuloSH);
		},

		/**
		 * 
		 * MODULO
		 * 
		 */

		onRequestValueHelpModulo: function (oEvent) {

			if (!this.getView().searchHelpModuloDialog) {
				this.getView().searchHelpModuloDialog = sap.ui.xmlfragment("searchHelpModuloDialog",
					"dinosol.din-colecciones-tiecol.fragment.DialogValueHelpModulo", this);
				this.getView().addDependent(this.getView().searchHelpModuloDialog);
			}

			var oValueHelp = sap.ui.core.Fragment.byId("searchHelpModuloDialog", "valueHelpDialogModulo");
			var oColsModel = new sap.ui.model.json.JSONModel({
				"cols": [{
					"label": "{i18n>label.modulo}",
					"template": "Modulo",
					"width": "15rem"
				}, {
					"label": "{i18n>label.descripcion}",
					"template": "Descripcion",
					"width": "15rem"
				}]
			});

			var oTable = oValueHelp.getTable();
			// oValueHelp.getTableAsync().then(function (oTable) {
			oTable.setModel(this.oProductsModel);
			oTable.setModel(oColsModel, "columns");

			if (oTable.bindRows) {
				oTable.bindAggregation("rows", "/modulos");
			}
			// oValueHelp.update();
			// }.bind(this));

			this.getView().searchHelpModuloDialog.setModel(new sap.ui.model.json.JSONModel());
			document.addEventListener("keypress", this.onKeyPressModuloSH.bind(this));
			this.toggleOpenSH();
			this.getView().searchHelpModuloDialog.open();
		},

		onSearchValueHelpModulo: function (oEvent) {

			var aSelectionSet = oEvent.getParameter("selectionSet") || this.getFilterBarControls("modulo");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				var sValue;
				if (oControl.getValue) {
					var sOp = sap.ui.model.FilterOperator.Contains;
					if (oControl.getValue()) {
						sValue = oControl.getValue();
						if (sValue.indexOf("*") === 0) {
							sOp = sap.ui.model.FilterOperator.EndsWith;
						}
						if (sValue.indexOf("*") > 0) {
							sOp = sap.ui.model.FilterOperator.StartsWith;
						}
						// if (oControl.getName() === "Ean") {
						// 	sOp = sap.ui.model.FilterOperator.EQ;
						// }
						sValue = sValue.replace(/\*/g, "");
						if (isNaN(parseInt(sValue)) === false) { // !sValue.toUpperCase
							aResult.push(
								new sap.ui.model.Filter({
									path: oControl.getName(),
									operator: sOp,
									value1: sValue
								}));
						} else {
							aResult.push(new sap.ui.model.Filter({
								filters: [
									new sap.ui.model.Filter({
										path: oControl.getName(),
										operator: sOp,
										value1: sValue.toUpperCase()
									}),
									new sap.ui.model.Filter({
										path: oControl.getName(),
										operator: sOp,
										value1: sValue
									})
								],
								and: false
							}));
						}
					}
				}
				if (oControl.getSelected) {
					if (oControl.getSelected()) {
						aResult.push(new sap.ui.model.Filter({
							path: oControl.getName(),
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "X"
						}));
					}
				}

				return aResult;
			}, []);

			var sLifnr = this.getView().searchHelpModuloDialog.getModel().getProperty("/lifnr");
			if (!!sLifnr) {
				this.getView().searchHelpModuloDialog.getTable().getBinding("rows").filter(undefined);
				this.getView().searchHelpModuloDialog.getTable().getBinding("rows").filter(aFilters);
				return;
			}

			var that = this;
			this.getView().searchHelpModuloDialog.getTable().setBusy(true);
			this.getComponentModel().read("/MCCatSurtidoSet", {
				filters: aFilters,
				success: function (oData) {
					that.getView().searchHelpModuloDialog.getTable().setBusy(false);
					that.getView().searchHelpModuloDialog.getModel().setProperty("/modulos", oData.results);
				},
				error: function (oData) {
					that.getView().searchHelpModuloDialog.getTable().setBusy(false);
				}
			});

		},

		onOKValueHelpModulo: function (oEvent) {

			var aTokens = oEvent.getParameter("tokens").length > 0 ? oEvent.getParameter("tokens") : this.getView().searchHelpModuloDialog._oSelectedTokens
				.getTokens();
			var aKeys = aTokens.map(function (oToken) {
				// this.getView().byId("moduloFilter").addToken(oToken);
				return {
					"Modulo": oToken.getKey()
				};
			}, this);
			this.setComponentModelProperty("search", "/Modulo", aKeys);
			this.getComponentModel("search").updateBindings(true);

			this.getView().searchHelpModuloDialog.close();
			document.removeEventListener("keypress", this.onKeyPressModuloSH);
			this.toggleOpenSH();
			this.getView().searchHelpModuloDialog.getTable().setSelectedIndex(-1);
			this.getView().searchHelpModuloDialog.getFilterBar().fireClear();
		},

		clearFiltersValueHelpModulo: function (oEvent) {

			this.getView().searchHelpModuloDialog.getFilterBar().getAllFilterItems().forEach(function (oItem, index) {
				var oContent = oItem.getControl();
				if (oContent.getValue) {
					oContent.setValue("");
				}
			});
		},

		onKeyPressModuloSH: function (e) {
			if (e.which === 13) {
				this.getView().searchHelpModuloDialog.getFilterBar().fireSearch();
			}
		},

		closeValueHelpDialogModulo: function () {

			this.getView().searchHelpModuloDialog.close();
			this.toggleOpenSH();
			document.removeEventListener("keypress", this.onKeyPressModuloSH);
		},

		/**
		 * 
		 * SURTIDO
		 * 
		 */

		onRequestValueHelpSurtido: function (oEvent) {

			if (!this.getView().searchHelpSurtidoDialog) {
				this.getView().searchHelpSurtidoDialog = sap.ui.xmlfragment("searchHelpSurtidoDialog",
					"dinosol.din-colecciones-tiecol.fragment.DialogValueHelpSurtido", this);
				this.getView().addDependent(this.getView().searchHelpSurtidoDialog);
			}

			var oValueHelp = sap.ui.core.Fragment.byId("searchHelpSurtidoDialog", "valueHelpDialogSurtido");
			var oColsModel = new sap.ui.model.json.JSONModel({
				"cols": [{
					"label": "{i18n>label.surtido}",
					"template": "Surtido",
					"width": "15rem"
				}, {
					"label": "{i18n>label.descripcion}",
					"template": "Descripcion",
					"width": "15rem"
				}]
			});

			var oTable = oValueHelp.getTable();
			// oValueHelp.getTableAsync().then(function (oTable) {
			oTable.setModel(this.oProductsModel);
			oTable.setModel(oColsModel, "columns");

			if (oTable.bindRows) {
				oTable.bindAggregation("rows", "/surtidos");
			}
			// oValueHelp.update();
			// }.bind(this));

			this.getView().searchHelpSurtidoDialog.setModel(new sap.ui.model.json.JSONModel());
			document.addEventListener("keypress", this.onKeyPressSurtidoSH.bind(this));
			this.toggleOpenSH();
			this.getView().searchHelpSurtidoDialog.open();
		},

		onSearchValueHelpSurtido: function (oEvent) {

			var aSelectionSet = oEvent.getParameter("selectionSet") || this.getFilterBarControls("surtido");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				var sValue;
				if (oControl.getValue) {
					var sOp = sap.ui.model.FilterOperator.Contains;
					if (oControl.getValue()) {
						sValue = oControl.getValue();
						if (sValue.indexOf("*") === 0) {
							sOp = sap.ui.model.FilterOperator.EndsWith;
						}
						if (sValue.indexOf("*") > 0) {
							sOp = sap.ui.model.FilterOperator.StartsWith;
						}
						// if (oControl.getName() === "Ean") {
						// 	sOp = sap.ui.model.FilterOperator.EQ;
						// }
						sValue = sValue.replace(/\*/g, "");
						if (isNaN(parseInt(sValue)) === false) { // !sValue.toUpperCase
							aResult.push(
								new sap.ui.model.Filter({
									path: oControl.getName(),
									operator: sOp,
									value1: sValue
								}));
						} else {
							aResult.push(new sap.ui.model.Filter({
								filters: [
									new sap.ui.model.Filter({
										path: oControl.getName(),
										operator: sOp,
										value1: sValue.toUpperCase()
									}),
									new sap.ui.model.Filter({
										path: oControl.getName(),
										operator: sOp,
										value1: sValue
									})
								],
								and: false
							}));
						}
					}
				}
				if (oControl.getSelected) {
					if (oControl.getSelected()) {
						aResult.push(new sap.ui.model.Filter({
							path: oControl.getName(),
							operator: sap.ui.model.FilterOperator.EQ,
							value1: "X"
						}));
					}
				}

				return aResult;
			}, []);

			var sLifnr = this.getView().searchHelpSurtidoDialog.getModel().getProperty("/lifnr");
			if (!!sLifnr) {
				this.getView().searchHelpSurtidoDialog.getTable().getBinding("rows").filter(undefined);
				this.getView().searchHelpSurtidoDialog.getTable().getBinding("rows").filter(aFilters);
				return;
			}

			var that = this;
			this.getView().searchHelpSurtidoDialog.getTable().setBusy(true);
			this.getComponentModel().read("/MCSurtidoSet", {
				filters: aFilters,
				success: function (oData) {
					that.getView().searchHelpSurtidoDialog.getTable().setBusy(false);
					that.getView().searchHelpSurtidoDialog.getModel().setProperty("/surtidos", oData.results);
				},
				error: function (oData) {
					that.getView().searchHelpSurtidoDialog.getTable().setBusy(false);
				}
			});

		},

		onOKValueHelpSurtido: function (oEvent) {

			var aTokens = oEvent.getParameter("tokens").length > 0 ? oEvent.getParameter("tokens") : this.getView().searchHelpSurtidoDialog._oSelectedTokens
				.getTokens();
			var aKeys = aTokens.map(function (oToken) {
				// this.getView().byId("moduloFilter").addToken(oToken);
				return {
					"Surtido": oToken.getKey()
				};
			}, this);
			this.setComponentModelProperty("search", "/Surtido", aKeys);
			this.getComponentModel("search").updateBindings(true);

			this.getView().searchHelpSurtidoDialog.close();
			document.removeEventListener("keypress", this.onKeyPressSurtidoSH);
			this.toggleOpenSH();
			this.getView().searchHelpSurtidoDialog.getTable().setSelectedIndex(-1);
			this.getView().searchHelpSurtidoDialog.getFilterBar().fireClear();
		},

		clearFiltersValueHelpSurtido: function (oEvent) {

			this.getView().searchHelpSurtidoDialog.getFilterBar().getAllFilterItems().forEach(function (oItem, index) {
				var oContent = oItem.getControl();
				if (oContent.getValue) {
					oContent.setValue("");
				}
			});
		},

		onKeyPressSurtidoSH: function (e) {
			if (e.which === 13) {
				this.getView().searchHelpSurtidoDialog.getFilterBar().fireSearch();
			}
		},

		closeValueHelpDialogSurtido: function () {

			this.getView().searchHelpSurtidoDialog.close();
			this.toggleOpenSH();
			document.removeEventListener("keypress", this.onKeyPressSurtidoSH);
		},

		loadTiendas: function () {
			var that = this;
			this.getComponentModel().read("/MCTiendaSet", {
				success: function (oData) {
					that.getComponentModel("tiendas").setProperty("/", oData.results);
					var oTiendaObj = {};
					oData.results.forEach(function (oTienda) {
						oTiendaObj[oTienda.Tienda] = oTienda.Descripcion;
					}, that);
					that.getComponentModel("tiendasObj").setProperty("/", oTiendaObj);
				},
				error: function (oError) {
					var oErrorModel = new sap.ui.model.json.JSONModel();
					oErrorModel.setJSON(oError.responseText);
					sap.m.MessageToast.show(oErrorModel.getData().error.message.value, {
						"width": "30em"
					});
				}
			});
		}

	});
});