sap.ui.define([
		"sap/ui/core/format/NumberFormat"
	],
	function (NumberFormat) {
		"use strict";
		return {

			colorSemaforoGeneral: function (oRow) {

				if (oRow) {
					return oRow.Message === "S" ? "green" : "red";
				}
				return "green";
			},

			srcSemaforoGeneral: function (oRow) {

				if (oRow) {
					return oRow.Message === "S" ? "sap-icon://status-positive" : "sap-icon://status-positive";
				}
				return "green";
			},

			templateText: function (oRow, oColumn) {

				var sValue;
				if (!oRow) {
					return "";
				}
				sValue = oRow[oColumn.field];
				return sValue;
			},

			templateTextArticulo: function (oRow, oColumn) {

				var sValue;
				if (!oRow) {
					return "";
				}
				sValue = oRow[oColumn.field];
				return sValue;
			},

			templateTitleArticulo: function (oRow, oColumn) {

				var sValue;
				if (!oRow) {
					return "";
				}
				sValue = oRow["Descripcion" + oColumn.field];
				return sValue;
			},

			templateTextDescripcion: function (oRow, oColumn) {

				var sValue;
				if (!oRow) {
					return "";
				}
				sValue = oRow[oColumn.field] + " - " + oRow["Descripcion" + oColumn.field];
				return sValue;
			},

			templateTextMotivo: function (oRow, oColumn) {

				var sValue;
				if (!oRow) {
					return "";
				}
				sValue = oRow[oColumn.field] + " - " + oRow[oColumn.field + "Txt"];
				return sValue;
			},

			formatTextListItem: function (sStatus) {
				return "Correcto";
			},
			formatIconListItem: function (sStatus) {
				return "sap-icon://accept";
			},
			formatStateListItem: function (sStatus) {
				return "Success";
			},

			formatIntroFechas: function (sFecha) {
				return sFecha;
			},

			formatDateShow: function (sInicio) {

				if (sInicio && sInicio != "") {

					var fnChange = function (sDate) {
						var sDay = sDate.substring(6, 8),
							sMonth = sDate.substring(4, 6),
							sYear = sDate.substring(0, 4);
						if (sDate.length === 0) {
							return undefined;
						}
						return sDay + "." + sMonth + "." + sYear;
					}
					return fnChange(sInicio) || "";
				}
			},

			formatDateShowTwo: function (sInicio, sFin) {

				if (sInicio && sInicio != "") {

					var fnChange = function (sDate) {
						var sDay = sDate.substring(6, 8),
							sMonth = sDate.substring(4, 6),
							sYear = sDate.substring(0, 4);
						return sDay + "." + sMonth + "." + sYear;
					}
					var dInicio = !!sInicio && sInicio !== "00000000" ? fnChange(sInicio) : undefined,
						dFin = !!sFin && sFin !== "00000000" ? fnChange(sFin) : undefined;
					if (dInicio && dFin) {
						return dInicio + " - " + dFin;
					} else {
						return "";
					}
				}
			},

			formatSurtido: function (sSurtido, oTiendas, sDescripcionSurtido) {

				if (!sSurtido) {
					return "";
				} else {
					console.log(sDescripcionSurtido);
					if (!!sDescripcionSurtido) {
						return sSurtido + " - " +sDescripcionSurtido;
					}
					return sSurtido;
					// return oTiendas[sSurtido];
				}
			},

			formatProveedor: function (sProveedor, sDescripcion) {

				if (!sProveedor) {
					return "";
				} else {
					return sProveedor + " - " +sDescripcion;
				}
			},

			formatModuloExc: function (sModulo, sDescripcion) {

				if (!sModulo) {
					return "";
				} else {
					return sDescripcion + " (" + sModulo + ")";
				}
			},
		};
	});