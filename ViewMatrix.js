/**
Optional args:
docLinkUrl - connection to IDM; if not specified, will point relative to the application domain
refElemName - ID of element where View Matrix button will be placed next to; if not specified, XT_0168 (Apply button)
dialogBorderWidth - if not specified, 20
ionApiUrl - ION API base url; if not specified, will not use ION API and use docLinkUrl instead
ionApiToken - Auth token; for dev purposes
*/
var ViewMatrix = (function () {
    function ViewMatrix() {
        this.docLinkUrlParamName = "docLinkUrl";
        this.referenceElementParamName = "refElemName";
        this.dialogBorderWidthParamName = "dialogBorderWidth";
        this.ionApiUrlParamName = "ionApiUrl";
        this.ionApiTokenParamName = "ionApiToken";
        this.buttonName = "matrixBtn";
		this.docLinkUrl = "/ca";
        this.referenceElementId = "XT_0168"; //Default reference element is the Apply button
        this.dialogBorderWidth = 20;
        this.Configuration = {
            PPS200: {
                keyName: "PUNO",
                left: 8,
                top: 4
            },
            OIS300: {
                keyName: "ORNO",
                left: 16,
                top: 2
            },
            MMS100: {
                keyName: "TRNR",
                left: 8,
                top: 5
            }
        };
        this.strTranslations = {
            "AR": "View matrix",
            "CZ": "Zobrazit matici",
            "DK": "Vis tabel",
            "DE": "Matrix anzeigen",
            "GR": "View matrix",
            "GB": "View Matrix",
            "ES": "Ver matriz",
            "FI": "Näytä taulukko",
            "FR": "Afficher grille",
            "IL": "View matrix",
            "HU": "Mátrix megtek",
            "IT": "Vedi matrice",
            "JP": "マトリックスを表示",
            "NO": "Matrisevisn",
            "NL": "Matrix weerg",
            "PL": "Pokaż macierz",
            "BR": "View matrix",
            "PT": "Ver matriz",
            "RU": "Просм матрицу",
            "SE": "Visa matris",
            "TR": "Matrisi grntle",
            "CS": "查看矩阵"
        };
    }
    ViewMatrix.Init = function (args) {
        new ViewMatrix().run(args);
    };
    ViewMatrix.prototype.run = function (args) {
        this.controller = args.controller;
        this.log = args.log;
        //// TODO Remove debug log level before using in production
        // this.log.SetDebug();
        this.progName = this.controller.GetProgramName();
		if (!this.Configuration[this.progName]) {
            this.log.Error("Fashion Matrix not supported in " + this.progName);
            return;
        }
        this.log.Debug("Running... " + this.progName);
        this.parseArgs(args.args);
        this.addButton();
    };
    ViewMatrix.prototype.parseArgs = function (args) {
        var values = {};
        if (args) {
            var parameters = args.split(",");
            for (var _i = 0, parameters_1 = parameters; _i < parameters_1.length; _i++) {
                var param = parameters_1[_i];
                var items = param.split("=");
                if (items.length === 2) {
                    values[items[0]] = items[1];
                }
            }
            this.docLinkUrl = values[this.docLinkUrlParamName] || this.docLinkUrl;
            this.referenceElementId = values[this.referenceElementParamName] || this.referenceElementId;
            this.dialogBorderWidth = values[this.dialogBorderWidthParamName] || this.dialogBorderWidth;
            this.ionApiUrl = values[this.ionApiUrlParamName];
            this.ionApiToken = values[this.ionApiTokenParamName];
        }
    };
    ViewMatrix.prototype.addButton = function () {
        var _this = this;
        var content = this.controller.GetContentElement();
        var buttonElement = new ButtonElement();
        buttonElement.Name = this.buttonName;
        buttonElement.Value = this.strTranslations[lang] || this.strTranslations["GB"];
        //Default position should the reference element not be found
        buttonElement.Position = {
            Top: this.Configuration[this.progName].top,
            Left: this.Configuration[this.progName].left
        };
        //Get Apply button position (Or some other reference element passed in args)
        var elements = content.Children;
        var referenceElem;
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            if (element.Name === this.referenceElementId) {
                referenceElem = element;
                break;
            }
        }
        //Compute View Matrix button position
        if (referenceElem) {
            var applyButtonPos = referenceElem.Position;
            buttonElement.Position = {
                Top: applyButtonPos.Top,
                Left: applyButtonPos.Left + applyButtonPos.Width + 1
            };
        }
        var button = content.AddElement(buttonElement);
        button.click({}, function () {
            _this.viewMatrix();
        });
    };
    ViewMatrix.prototype.getMatrixData = function () {
        var matrixUserContext = ScriptUtil.GetUserContext();
        var keyName = this.Configuration[this.progName].keyName;
        var data = {
            currentCompany: matrixUserContext.CurrentCompany,
            currentDivision: matrixUserContext.CurrentDivision,
            keyName: keyName,
            keyValue: ListControl.ListView.GetValueByColumnName(keyName)[0],
            programName: this.progName,
            language: matrixUserContext.CurrentLanguage || lang,
            docLinkUrl: this.docLinkUrl
        };
        if (this.ionApiUrl) {
            data.ionApiUrl = this.ionApiUrl;
            data.ionApiToken = this.ionApiToken;
        }
        return data;
    };
    ViewMatrix.prototype.viewMatrix = function () {
        var matrixData = this.getMatrixData();
        if (matrixData.keyValue) {
            var matrixUrl = "/mne/ext/fashionmatrix/";
            var queryString = this.formQueryString(matrixData);
            var matrixWindow = this.openDialog();
            var matrixFrame = $('<iframe width="100%" height="100%" style="margin: 0; padding: 0; border: none;"></iframe>').attr("src", (matrixUrl + queryString));
            matrixWindow.append(matrixFrame);
        }
    };
    ViewMatrix.prototype.formQueryString = function (matrixData) {
        var queryArray = ["#/?"];
        for (var key in matrixData) {
            queryArray.push(key);
            queryArray.push("=");
            queryArray.push(matrixData[key]);
            queryArray.push("&");
        }
        queryArray.pop();
        return queryArray.join("");
    };
    ViewMatrix.prototype.openDialog = function () {
        var matrixDialog, dialogId, settings, o;
        matrixDialog = $("<div>", {
            "id": "matrixDialog",
            "class": "inforMessageDialog matrixDialog",
            "tabindex": 0
        });
        dialogId = matrixDialog.attr("id");
        if (!H5ControlUtil.H5Dialog.AddDialogInstance(dialogId)) {
            matrixDialog.remove();
            return;
        }
        settings = {
            title: Lang.MessageBoxTitle,
            dialogType: "General",
            closeOnEscape: false,
            beforeClose: function (e, ui) {
                H5ControlUtil.H5Dialog.DestroyDialog($(e.target));
            },
            open: function (event, ui) {
                $(this).parent().find('div.caption').removeAttr('title');
                $(this).parent().find('[title]').not(".inforErrorIcon").inforToolTip();
            },
            buttons: [],
            autoFocus: true,
            width: ($(window).width() - 100),
            height: ($(window).height() - this.dialogBorderWidth * 2)
        };
        o = $.extend({}, settings, Option);
        matrixDialog.inforMessageDialog(o);
        return matrixDialog;
    };
    return ViewMatrix;
}());
//# sourceMappingURL=ViewMatrix.js.map
