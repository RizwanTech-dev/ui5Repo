sap.ui.define([
	"com/riztech/ui5app/project1/base/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/riztech/ui5app/project1/utils/Constant",
	"sap/m/PDFViewer",
	"sap/m/MessageBox"

], (Controller, JSONModel, Constant, PDFViewer, MessageBox) => {
	"use strict";

	return Controller.extend("com.riztech.ui5app.project1.container.birt.Birt", {
		onInit() {
			console.log("hello Home");
			var ORouter = this.getRouter();

			// ORouter.getRoute("birt").attachMatched(this._onRouteMatched, this);
			this.handleRoute("birt", this._onRouteMatched, this);
		},

		_onRouteMatched: function () {
			this.setInitialModel();
			this.getBirtData();

			let oReportModel = new sap.ui.model.json.JSONModel({
				records: [],
				busy: true,
				selectedReport: null
			});
			this.getView().setModel(oReportModel, "reports");

			// this.loadReports();
		},

		async loadReports(fPath) {
			try {
				let path = Constant.URL.getBirtReports;
				let data = null;
				if (fPath) {
					data = {
						folderPath: fPath
					};
				}

				const result = await this.restMethodPostData(path, data);

				let oReportModel = this.getView().getModel("reports");

				oReportModel.setProperty("/records", result || []);
				oReportModel.setProperty("/busy", false);

			} catch (error) {
				console.error("Failed to load BIRT reports:", error);

				let oReportModel = this.getView().getModel("reports");

				oReportModel.setProperty("/records", []);
				oReportModel.setProperty("/busy", false);
			}
		},

		setInitialModel: function () {
			this._sValidPath = sap.ui.require.toUrl("sap/m/sample/PDFViewerMultiple/sample.pdf");
			this._sInvalidPath = sap.ui.require.toUrl("sap/m/sample/PDFViewerMultiple/sample_nonexisting.pdf");
			this._oModel = new JSONModel({
				Source: this._sValidPath,
				Title1: "My Birt Report",
				Title2: "My Birt Report",
				Height: "600px",
				folderPath: "",
				reportName: "dummy",
				contextName: "inputObject",
				parametersText: `{
"parameterOne":"1000"
}`,
				payloadText: `{
"test": [
		{"col1": "Test"}],

"dummySet": [
		{"id": 1,"name": "test"}
		]
						
}`,
				parameters: {},
				payload: {},
				qrCodeValue: "Hello QR",
				previewBtnBusy: false,
				records: [
					// { "id": 1, "reportRef": "TESTReport1" },
					// { "id": 2, "reportRef": "TESTReport2" }
				],
				id: null,

				loader: {
					recordsBusy: true,
					saveBusy: false
				}






			});
			this.getView().setModel(this._oModel);

		},

		onPressBack: function () {
			this.getRouter().navTo("dashboard");
		},
		onChangeFolderPath: async function () {
			let oModel = this.getView().getModel();
			let oData = oModel.getData();

			// Get the selected full file path (example: D:\Rizwan\...\dummy.rptdesign)
			let fullPath = oData.folderPath || ""; // or however you get the path input

			if (fullPath) {
				// Normalize slashes
				let normalizedPath = fullPath.replace(/\\/g, "/");

				// Extract report name (without extension)
				let reportName = normalizedPath.substring(normalizedPath.lastIndexOf("/") + 1).replace(".rptdesign", "");

				// Extract folder path (excluding the file)
				let folderPath = normalizedPath.substring(0, normalizedPath.lastIndexOf("/"));

				// Update model
				await this.loadReports(folderPath);
				oData.folderPath = folderPath;
				oData.reportName = reportName;
			} else {
				oData.folderPath = "";
				oData.reportName = "";
			}

			oModel.refresh();
		},

		//Open PDF in New Window
		onClickPreviewScreen: async function () {
			let oModel = this.getView().getModel();
			let oData = oModel.getData();
			oModel.setProperty("/previewBtnBusy", true);
			let fileName = oData.reportName;
			let folderPath = oData.folderPath;
			let contextName = oData.contextName;
			let imageData = oData.payload.images;
			// ✅ Ensure payload is a valid object
			let payload = null;

			// ✅ Safe JSON parse helper
			const safeParse = (value) => {
				if (typeof value === "string") {
					try {
						return JSON.parse(value);
					} catch (e) {
						oModel.setProperty("/previewBtnBusy", false);
						console.error("Invalid JSON:", e);
						sap.m.MessageToast.show("Invalid JSON format. Please check your input.");
						throw e;
					}
				} else if (typeof value === "object" && value !== null) {
					return value;
				} else {
					return {};
				}
			};
			// Parse parameters
			if (oData.parametersText || oData.parameters) {
				oData.parameters = safeParse(oData.parametersText || oData.parameters);
			}

			// Parse payload
			if (oData.payloadText || oData.payload) {
				oData.payload = safeParse(oData.payloadText || oData.payload);
			}

			// Handle images safely
			// if (oData.payload && Array.isArray(oData.payload.images)) {
			oData.payload.images = (imageData || []).filter(f => f?.base64String);
			// }
			// else {
			// 	oData.payload.images = [];
			// }
			//Set the payload
			payload = oData;
			try {
				// let response =  await this.restMethodPostParamWithFile(folderPath, fileName, contextName, payload); // Base64 string
				let response = await this.restMethodPostParamWithFile(oData); // Base64 string


				var contentType = 'application/pdf';
				var blob = this.b64toBlob(response, contentType);
				var blobUrl = URL.createObjectURL(blob);
				jQuery.sap.addUrlWhitelist("blob");
				if (this._pdfViewer) {
					this._pdfViewer.setSource(blobUrl);
					this._pdfViewer.setTitle("Reservation Form (Preview)");

				} else {
					this._pdfViewer = await new PDFViewer({
						isTrustedSource: true,
						source: blobUrl,
						title: fileName + " (Preview)",
						width: "500%",
						height: "500%",

					});
				}


				this._flexxBox = this.getView().byId("myFlexBox");
				this._flexxBox.addItem(this._pdfViewer);

				oModel.setProperty("/previewBtnBusy", false);
				// this.loadPrevPDF([response]);//Old Code 
			} catch (error) {
				MessageBox.show(error);
			} finally {

				oModel.setProperty("/previewBtnBusy", false);
			}


		},


		loadPrevPDF: async function (obj) {
			const {
				degrees, PDFDocument, rgb, StandardFonts
			} = PDFLib;
			var contentType = 'application/pdf';
			var pdfs = obj;// obj.getData();
			const pdfDocDisp = await PDFDocument.create()
			var firstPDF = pdfs[0];
			var blob = this.b64toBlob(firstPDF, contentType);
			var blobUrl = URL.createObjectURL(blob);
			var sourceBuffer = await fetch(blobUrl).then((res) => res.arrayBuffer())
			// Load a PDFDocument from the existing PDF bytes
			const pdfDoc = await PDFDocument.load(sourceBuffer);
			var isFirst = true;
			const pdfDoc1 = await PDFDocument.create()
			for (let pdf of pdfs) {
				//if(isFirst == false){
				var blob1 = this.b64toBlob(pdf, contentType);
				var blobUrl1 = URL.createObjectURL(blob1);
				var sourceBuffer1 = await fetch(blobUrl1).then((res) => res.arrayBuffer())
				// Load a PDFDocument from the existing PDF bytes
				var pdfItems = await PDFDocument.load(sourceBuffer1);
				const pages = pdfItems.getPages();
				for (let i = 0; i < pages.length; i++) {
					const firstPage = pages[i]
					const [existingPage] = await pdfDocDisp.copyPages(pdfItems, [i])
					pdfDocDisp.insertPage(pdfDocDisp.getPages().length, existingPage);
				}
				//}
				isFirst = false;
			}
			const base64String = await pdfDocDisp.saveAsBase64();
			var blob = this.b64toBlob(base64String, contentType);
			var blobUrl = URL.createObjectURL(blob);
			jQuery.sap.addUrlWhitelist("blob");

			this._sValidPath = blobUrl;
			this._oModel.setProperty("/Source", this._sValidPath);

			// this._pdfViewer = new PDFViewer();
			// this.getView().addDependent(this._pdfViewer);
			// this._pdfViewer.setSource(blobUrl);
			// this._pdfViewer.open();
			// this.showLoading(false);
		},

		b64toBlob: function (b64Data, contentType, sliceSize) {
			contentType = contentType || '';
			sliceSize = sliceSize || 512;
			let cleanB64 = b64Data.replace(/\s/g, '');  // remove all whitespace/newlines
			const byteCharacters = atob(cleanB64);

			// var byteCharacters = atob(b64Data);
			var byteArrays = [];

			for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				var slice = byteCharacters.slice(offset, offset + sliceSize);

				var byteNumbers = new Array(slice.length);
				for (var i = 0; i < slice.length; i++) {
					byteNumbers[i] = slice.charCodeAt(i);
				}

				var byteArray = new Uint8Array(byteNumbers);

				byteArrays.push(byteArray);
			}

			var blob = new Blob(byteArrays, { type: contentType });
			return blob;
		},
		//Upload Image
		onPressUploadImage: async function (oEvent) {
			try {

				const file = oEvent.getParameter("files")[0];
				const base64String = await this.fileToBase64(file);
				let oModel = this.getView().getModel();
				let oData = oModel.getData();
				let count = oData?.payload?.images?.length || 0;
				let imageObj = {
					id: count,
					imageTitle: file.name,
					imageName: file.name.replace(/\.[^/.]+$/, ""), // removes extension
					base64String: base64String
				};

				oData.payload.images.push(imageObj);
				oModel.refresh();
			} catch (ex) {
				console.error(ex);
			}
		},
		onAddImage: function () {
			let oModel = this.getView().getModel();
			let oData = oModel.getData();
			oData.payload.images.push({});
			oModel.refresh();
		},
		onPressSave: async function () {
			let oModel = this.getView().getModel();
			let oData = oModel.getData();
			this.getView().getModel().setProperty("/loader/saveBusy", true);
			let path = Constant.URL.saveBirt;
			await this.birtUIHelper(oData, 1);
			try {
				await this.restMethodPost(path, oData);
			} catch (error) {
				this.getView().getModel().setProperty("/loader/saveBusy", false);
			}
			this.getBirtData();
			this.getView().getModel().setProperty("/loader/saveBusy", false);
		},
		getBirtData: async function () {
			let path = Constant.URL.getBirtData
			let result = await this.restMethodGet(path);
			let oModel = this.getView().getModel();
			let oData = oModel.getData();
			oData.records = result || [];
			oData.loader.recordsBusy = false;
			oModel.refresh();
		},
		onChangeBirt: async function (oEvent) {
			let selectedKey = oEvent.getSource().getSelectedKey();

			let oModel = this.getView().getModel();
			let oData = oModel.getData();

			let selectedObj = oData.records.find(f => f.id == selectedKey);
			await this.birtUIHelper(selectedObj);
			Object.assign(oData, selectedObj);
		},
		birtUIHelper: function (selectedObj, condition) {
			if (condition == 1) { //parse
				selectedObj.payload = JSON.parse(selectedObj.payloadText);
				selectedObj.parameters = JSON.parse(selectedObj.parametersText);
			}
			else {//stringify
				selectedObj.payloadText = JSON.stringify(selectedObj.payload, null, "\t");
				selectedObj.parametersText = JSON.stringify(selectedObj.parameters, null, "\t");
			}
		}

	});
});