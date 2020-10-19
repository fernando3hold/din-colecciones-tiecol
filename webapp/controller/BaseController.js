sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/format/NumberFormat",
	"../model/formatter",
], function (Controller, MessageBox, NumberFormat, formatter) {
	"use strict";

	return Controller.extend("BaseController", {

		formatter: formatter,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf view.Results
		 */
		onLogout: function () {
			this.getOwnerComponent().onCerrarSesion();
		},
		
		getFlexibleColumn : function(){
			return this.getOwnerComponent().getRootControl().getContent()[0];
		},
		
		getText : function(sKeyText){
			return this.getOwnerComponent().getModel("i18n").getProperty(sKeyText);
		},

		getAmbitoPagina: function () {
			return this.getView().getModel("viewModel").getProperty("/ambitoPagina");
		},

		getViewModel: function () {
			return this.getView().getModel("viewModel");
		},

		getComponentModel: function (sModel) {
			return this.getOwnerComponent().getModel(sModel);
		},

		getComponentModelProperty: function (sModel, sProperty) {
			return this.getOwnerComponent().getModel(sModel).getProperty(sProperty);
		},

		setComponentModelProperty: function (sModel, sProperty, sValue) {
			return this.getOwnerComponent().getModel(sModel).setProperty(sProperty, sValue);
		},
		
		getViewModelProperty : function(sProperty){
			return this.getView().getModel("viewModel").getProperty(sProperty);
		},
		setViewModelProperty : function(sProperty, sValue){
			return this.getView().getModel("viewModel").setProperty(sProperty, sValue);
		},

	});

});