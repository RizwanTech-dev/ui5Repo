sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/Router",
  "sap/m/PDFViewer",
  "com/riztech/ui5app/project1/utils/Constant",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/m/Text",
  "sap/ui/core/HTML",
  "sap/m/MessageBox"
], (
  Controller,
  Router,
  PDFViewer,
  Constant,
  Dialog,
  Button,
  List,
  StandardListItem,
  Text,
  HTML,
  MessageBox
) => {
  return Controller.extend("com.riztech.ui5app.project1.base.BaseController", {
    // code
    onInit: function () {
      console.log("test");
    },
    getRouter: function () {
      return sap.ui.core.UIComponent.getRouterFor(this);
    },
    getModel: function (sName) {
      return this.getView().getModel(sName);
    },
    handleRoute: function (route, method, control) {
      this.getRouter().getRoute(route).attachMatched(method, control);
    },
    getHostDetail: function () {
      return Constant.URL.base;
    },
    restMethodPost: function (path, body) {
      let request = body;
      var bsURL = Constant.URL.base;
      var url = bsURL + path;                          //`generate`;
      var deferred = $.Deferred();
      $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(request),
        contentType: "application/json",
        success: function (response) {
          deferred.resolve(response);
        },
        error: function (xhr) {
          deferred.reject(xhr);
        },
      });
      return deferred.promise();
    },
    restMethodPostParam: function (uri, requestData) {
      var bsURL = Constant.URL.base;
      var url = bsURL + uri;
      var deferred = $.Deferred();

      $.ajax({
        type: "POST",
        url: url,
        data: $.param(requestData),  // Encode data like key=value&key2=value2
        contentType: "application/x-www-form-urlencoded",  // Important
        success: function (response) {
          deferred.resolve(response);
        },
        error: function (xhr) {
          deferred.reject(xhr);
        }
      });

      return deferred.promise();
    },
    restMethodGet(url) {
      var bsURL = Constant.URL.base;
      var url = bsURL + url;
      var deferred = $.Deferred();

      $.ajax({
        type: "GET",
        url: url,
        contentType: "application/json",
        success: function (response) {
          deferred.resolve(response);
        },
        error: function (xhr) {
          deferred.reject(xhr);
        }
      });
      return deferred.promise();

    },
    restMethodPostData(url, data = null) {

      var bsURL = Constant.URL.base;
      var fullUrl = bsURL + url;

      var deferred = $.Deferred();

      $.ajax({
        type: "POST",
        url: fullUrl,
        data: data ? JSON.stringify(data) : null,
        contentType: "application/json",

        success: function (response) {
          deferred.resolve(response);
        },

        error: function (xhr) {
          deferred.reject(xhr);
        }
      });

      return deferred.promise();
    },
    // restMethodPostParamWithFile: function (folderPath, reportName, contextName, requestData) {
    //   var bsURL = Constant.URL.base;
    //   var url = bsURL + `generate_with_json_object?folderPath=${encodeURIComponent(folderPath)}&reportName=${encodeURIComponent(reportName)}&contextName=${encodeURIComponent(contextName)}`;
    //   var deferred = $.Deferred();

    //   $.ajax({
    //     type: "POST",
    //     url: url,
    //     data: JSON.stringify(requestData),
    //     contentType: "application/json",
    //     success: function (response) {
    //       deferred.resolve(response);
    //     },
    //     error: function (xhr) {
    //       deferred.reject(xhr);
    //     }
    //   });

    //   return deferred.promise();
    // },
    restMethodPostParamWithFile: function (requestData) {
      var bsURL = Constant.URL.base;
      var url = bsURL + `generate_with_json_object`;
      var deferred = $.Deferred();

      $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(requestData),
        contentType: "application/json",
        success: function (response) {
          deferred.resolve(response);
        },
        error: function (xhr) {
          deferred.reject(xhr);
        }
      });

      return deferred.promise();
    },
    restMethodGetReportLink: function (url) {//Birt Report get request get method 
      url = this.getHostDetail() + url;
      var deferred = $.Deferred();

      $.ajax({
        type: "GET",
        url: url,
        contentType: "application/json",
        headers: {
          "x-csrf-token": "fetch",
          "Content-Type": "application/json",
        },
        xhrFields: {
          responseType: 'blob'  // Expect binary data (like PDF)
        },
        success: function (blob, status, xhr) {
          // Extract filename from header if available
          var disposition = xhr.getResponseHeader('Content-Disposition');
          var filename = "download.pdf";

          if (disposition) {
            var utfMatch = disposition.match(/filename\*\=UTF-8''(.+)/);
            if (utfMatch && utfMatch[1]) {
              filename = decodeURIComponent(utfMatch[1].replace(/\+\-\+/g, "-").replace(/\+/g, " "));
            } else {
              var normalMatch = disposition.match(/filename=\"?([^;\"]+)\"?/);
              if (normalMatch && normalMatch[1]) {
                filename = normalMatch[1].replace(/\+\-\+/g, "-").replace(/\+/g, " ");
              }
            }
          }


          // Create download link
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);

          deferred.resolve();
        },
        error: function (xhr) {
          console.error("Failed to download PDF:", xhr);
          deferred.reject(xhr);
        }
      });

      return deferred.promise();
    },
    restMethodPostReportLink: function (url, postData) {//Birt report post the object and get the direct link
      url = this.getHostDetail() + url;
      var deferred = $.Deferred();

      $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(postData), // sending body
        contentType: "application/json",
        headers: {
          "x-csrf-token": "fetch"
        },
        xhrFields: {
          responseType: 'blob'  // Expect binary data (like PDF)
        },
        success: function (blob, status, xhr) {
          var disposition = xhr.getResponseHeader('Content-Disposition');
          var filename = "download.pdf";

          if (disposition) {
            var utfMatch = disposition.match(/filename\*\=UTF-8''(.+)/);
            if (utfMatch && utfMatch[1]) {
              filename = decodeURIComponent(utfMatch[1].replace(/\+\-\+/g, "-").replace(/\+/g, " "));
            } else {
              var normalMatch = disposition.match(/filename=\"?([^;\"]+)\"?/);
              if (normalMatch && normalMatch[1]) {
                filename = normalMatch[1].replace(/\+\-\+/g, "-").replace(/\+/g, " ");
              }
            }
          }

          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);

          deferred.resolve();
        },
        error: function (xhr) {
          console.error("Failed to download PDF:", xhr);
          deferred.reject(xhr);
        }
      });

      return deferred.promise();
    },
    onOpenDialog: async function (sPath) {
      //Common dialog open function
      if (this.oDialog) {
        this.oDialog.destroy();
        delete this.oDialog;
      }
      if (!this.oDialog) {
        this.oDialog = await this.loadFragment({
          name: sPath,
        });
      }

      this.oDialog.open(); //Open Dialog
      return this.oDialog;
    },
    onCloseDialog: async function () {
      //Common dialog close function
      if (this.oDialog && this.oDialog.close) {
        this.oDialog.close(); //Close Dialog
        this.oDialog.destroy();
        delete this.oDialog;
      }
    },
    openTargetScreen: function (route) {
      if (!route) {
        route = "defaultRoute"
      }
      this.getRouter().navTo("defaultRoute");
    },
    // PDF VIEWER
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
      this._pdfViewer = new PDFViewer();
      this.getView().addDependent(this._pdfViewer);
      this._pdfViewer.setSource(blobUrl);
      //this._pdfViewer.setTitle("Sales Order");
      //this._pdfViewer.setPopupHeaderTitle("Sales Order");
      this._pdfViewer.open();
      this.showLoading(false);
    },
    b64toBlob: function (b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      var byteCharacters = atob(b64Data);
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
    fileToBase64: function (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // produces "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,...."
        reader.onload = () => resolve(reader.result.split(",")[1]); // keep only base64 part
        reader.onerror = error => reject(error);
      });
    },
    uploadAndParseExcel: async function (url, data) {
      const fullUrl = "http://localhost:8081/" + url;

      // Wrap ArrayBuffer in Blob
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const formData = new FormData();
      formData.append("file", blob, "uploaded.xlsx"); // "file" must match @RequestParam("file")

      return new Promise((resolve, reject) => {
        $.ajax({
          type: "POST",
          url: fullUrl,
          data: formData,
          contentType: false, // ✅ Must be false to allow multipart/form-data
          processData: false, // ✅ Do not transform the FormData
          success: function (response) {
            resolve(response);
          },
          error: function (xhr) {
            reject(xhr.responseText || xhr);
          }
        });
      });
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

      this._pdfViewer = new PDFViewer();
      this.getView().addDependent(this._pdfViewer);
      this._pdfViewer.setSource(blobUrl);
      this._pdfViewer.open();
      this.showLoading(false);
    },

    b64toBlob: function (b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;
      let cleanB64 = (b64Data || "").replace(/^data:application\/pdf;base64,/, '').replace(/\s/g, '');
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
    /**
     * Production-safe PDF preview dialog with download functionality.
     * Decodes Base64/Data URI to Blob, applies URL security whitelist,
     * and displays the PDF inside a full-stretch Dialog using a native iframe.
     * Includes a dedicated Download button in the dialog footer.
     *
     * @param {string} sBase64Data - Base64 encoded PDF string
     * @param {string} [sFileName="report.pdf"] - Download filename
     * @param {string} [sTitle="PDF Preview"] - Dialog header title
     * @returns {sap.m.Dialog|null} Dialog instance
     */
    openPdfPreviewDialog: function (sBase64Data, sFileName, sTitle) {
      if (!sBase64Data || typeof sBase64Data !== "string" || sBase64Data.trim().length === 0) {
        MessageBox.error("No valid PDF data received for preview.");
        return null;
      }

      sFileName = sFileName || "report.pdf";
      if (!sFileName.toLowerCase().endsWith(".pdf")) {
        sFileName += ".pdf";
      }
      sTitle = sTitle || "PDF Preview";

      try {
        var blob = this.b64toBlob(sBase64Data, "application/pdf");
        var downloadUrl = window.URL.createObjectURL(blob);

        if (jQuery.sap && jQuery.sap.addUrlWhitelist) {
          jQuery.sap.addUrlWhitelist("blob");
        }
        if (sap.ui.core && sap.ui.core.security && sap.ui.core.security.URLWhitelist) {
          sap.ui.core.security.URLWhitelist.add("blob");
        }

        var that = this;
        var oDialog = new Dialog({
          title: sTitle,
          icon: "sap-icon://pdf-attachment",
          contentWidth: "100%",
          contentHeight: "100%",
          stretch: true,
          resizable: true,
          draggable: true,
          content: new HTML({
            preferDOM: false,
            content:
              '<div style="position:relative; width:100%; height:100%; min-height:85vh; overflow:hidden;">' +
              '  <iframe src="' + downloadUrl + '#toolbar=1" ' +
              '          style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" ' +
              '          type="application/pdf">' +
              '  </iframe>' +
              '</div>'
          }),
          beginButton: new Button({
            text: "Download",
            icon: "sap-icon://download",
            type: "Emphasized",
            press: function () {
              var link = document.createElement("a");
              link.href = downloadUrl;
              link.setAttribute("download", sFileName);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }),
          endButton: new Button({
            text: "Close",
            icon: "sap-icon://decline",
            press: function () {
              oDialog.close();
            }
          }),
          afterClose: function () {
            oDialog.destroy();
            window.URL.revokeObjectURL(downloadUrl);
          }
        });

        if (this.getView && typeof this.getView === "function" && this.getView()) {
          this.getView().addDependent(oDialog);
        }

        oDialog.open();
        return oDialog;
      } catch (err) {
        console.error("Error opening PDF preview dialog:", err);
        MessageBox.error("Failed to render PDF preview: " + (err.message || err));
        return null;
      }
    },
    //Excel codes
    restMethodPostExcel2: function (url, request, templateName) {
      const fullUrl = Constant.URL.base + url + "?templateName=" + encodeURIComponent(templateName);

      // Include the templateName in the request body
      const payload = {
        templateName: templateName, // send template name
        sheets: request.sheets       // send the sheets array
      };

      var deferred = $.Deferred();

      $.ajax({
        type: "POST",
        url: fullUrl,
        data: JSON.stringify(payload),
        contentType: "application/json",
        processData: false,
        xhrFields: {
          responseType: 'blob' // Important for file download
        },
        success: function (blob, status, xhr) {
          const disposition = xhr.getResponseHeader('Content-Disposition');
          let filename = templateName ? templateName + ".xlsx" : "download.xlsx";

          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);

          deferred.resolve();
        },
        error: function (xhr) {
          console.error("Failed to download:", xhr);
          deferred.reject(xhr);
        }
      });

      return deferred.promise();
    },
    //Progress Bar
    _updateProgress: async function (progressText, progressBar, message, percentage) {
      progressText.setText(message);
      progressBar.setPercentValue(percentage);
      progressBar.setDisplayValue(percentage + "%");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating loading delay
    },

    _openApiFetcher: async function () {

      this.oDialog ??= await this.loadFragment({
        name: "com.riztech.ui5app.project1.fragments.apiFetcherDialog"
      });
      this.oDialog.open();
    },
    onCloseDialog: function () {

      this.oDialog.close();

    },
    //Session Storages Start
    setSessionData: function (key, data) {
      if (!key) return;

      try {
        const jsonData = JSON.stringify(data);
        sessionStorage.setItem(key, jsonData);
      } catch (err) {
        console.error("Error storing session data:", err);
      }
    },
    getSessionData: function (key) {
      if (!key) return null;

      try {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        console.error("Error retrieving session data:", err);
        return null;
      }
    },
    //Session Storages End






    //code
  })
})