var CenPosM3_v4 = new function () {
    var category = "CenPosM3_v4";
    var _$host;
    var Child;
    var Timer;
    var debug;
    var isDebug;
    //var cenPosResponse: string;
    this.Init = function (scriptArgs) {
        // Set isDebug to true to activate logging to the console
        isDebug = true;
        // Uncomment debugger in order to be able to set break points in chrome debugger tool.
        debugger;
        // Initially clear the console window
        //_debug.Clear();
        if (isDebug) {
            debug = console.log.bind(window.console);
        }
        else {
            debug = function () { };
        }
        // Set script variables
        var _args = scriptArgs.args;
        var _debug = scriptArgs.debug;
        var _controller = scriptArgs.controller;
        var _renderEngine = _controller.RenderEngine;
        var _$content = _renderEngine.Content;
        var _userContext = undefined;
        _$host = _controller.ParentWindow;
        // Get program details - Just to showcase some render enginge usage
        var gotProgramDetails = getProgramDetails(_renderEngine);
        if (!gotProgramDetails) {
            return;
        }
        var panelHeader = _renderEngine.PanelHeader;
        removeEventHandlers(panelHeader);
        if (panelHeader == 'OIS215/B') {
            var elementNextButton = _$host.find('#Next');
            var elementCreateButton = _$host.find('.new');
            var checkCenPos = ScriptUtil.GetFieldValue('WS3RDP');
            if (checkCenPos == null || checkCenPos.toLowerCase() !== 'CenPos'.toLowerCase()) {
                return;
            }
            //_controller.isProcessing = true;
            if (elementNextButton.length > 0) {
                ScriptUtil.AddEventHandler(elementNextButton, 'mouseDown.OIS215B', function (e) {
                    _controller.isProcessing = true;
                }, {});
                ScriptUtil.AddEventHandler(elementNextButton, 'click.OIS215BNext', prepareDataOIS215B, { controller: _controller, panelHeader: panelHeader });
            }
            if (elementCreateButton.length > 0) {
                ScriptUtil.AddEventHandler(elementCreateButton, 'click.OIS215BCreate', prepareDataOIS215B, { controller: _controller, panelHeader: panelHeader });
            }
            ScriptUtil.AddEventHandler(_$host, 'keydown.OIS215B', prepareDataOIS215B, { controller: _controller, panelHeader: panelHeader });
        }
        else if (panelHeader == 'OIS215/D') {
            var trdp = ScriptUtil.GetFieldValue('WE3RDP');
            var elementNextButton = _$host.find('#Next');
            if (elementNextButton.length > 0) {
                if (typeof trdp === 'undefined' || trdp === null || trdp.toLowerCase() !== 'CenPos'.toLowerCase()) {
                    return;
                }
                else {
                    //_controller.isProcessing = true;
                    ScriptUtil.AddEventHandler(elementNextButton, 'mouseDown.OIS215D', function (e) {
                        _controller.isProcessing = true;
                    }, {});
                    //ScriptUtil.AddEventHandler(elementNextButton, 'click.OIS215D', prepareDataOIS215D, { controller: _controller, panelHeader: panelHeader });
                    elementNextButton.one('click.OIS215D', { controller: _controller, panelHeader: panelHeader }, prepareDataOIS215D);
                }
            }
        }
        else if (panelHeader == 'CRS435/E') {
            var checkCenPos = ScriptUtil.GetFieldValue('WW3RDP');
            if (typeof checkCenPos === 'undefined' || checkCenPos == null || checkCenPos.toLowerCase() !== 'CenPos'.toLowerCase()) {
                return;
            }
            var submitButton = undefined;
            var buttonsElem = _$host.find('button');
            if (buttonsElem.length > 0) {
                for (var i = 0; i < buttonsElem.length; i++) {
                    var fkey = buttonsElem.eq(i).attr('fkey');
                    if (typeof fkey !== typeof undefined) {
                        if (fkey === 'F16') {
                            submitButton = buttonsElem.eq(i);
                            break;
                        }
                    }
                }
            }
            if (submitButton && submitButton.length > 0) {
                ScriptUtil.AddEventHandler(submitButton, 'click.CRS435E', prepareDataCRS435E, { controller: _controller, panelHeader: panelHeader });
            }
        }
    };
    function openCenposDialog(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435) {
        // Load first all the required cenpos script
        var $this = this;
        ScriptUtil.LoadScript("https://code.jquery.com/jquery-migrate-1.2.1.min.js", function (data) {
            ScriptUtil.LoadScript("https://www.cenpos.com/Plugins/porthole.min.js", function (data) {
                ScriptUtil.LoadScript("https://www.cenpos.com/Plugins/jquery.cenpos.2.3.post.js", function (data) {
                    run(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435);
                });
            });
        });
    }
    ;
    function run(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435) {
        var cenposDialog, dialogId, settings, o;
        cenposDialog = $("<div>", {
            "id": "cenposDialog",
            "class": "inforMessageDialog cenposDialog",
            "tabindex": 0
        });
        var width = 400;
        var height = 500;
        if (panelHeader === "OIS215/D") {
            width = 580;
            height = 500;
        }
        dialogId = cenposDialog.attr("id");
        if (!H5ControlUtil.H5Dialog.AddDialogInstance(dialogId)) {
            cenposDialog.remove();
            return;
        }
        settings = {
            title: "Cenpos Form",
            dialogType: "General",
            closeOnEscape: false,
            beforeClose: function (e, ui) {
                H5ControlUtil.H5Dialog.DestroyDialog($(e.target));
            },
            open: function (event, ui) {
                var cenposDialog = $(this);
                $(this).parent().find('div.caption').removeAttr('title');
                $(this).parent().find('[title]').not(".inforErrorIcon").inforToolTip();
                $(event.target).createWebpay({
                    url: url,
                    params: params
                });
                var cenposIframe = $("#cenposPayIFrameId");
                Timer = setInterval(counter, 1000, [controller, inFields, preData, panelHeader, inFieldsCRS435, cenposIframe, cenposDialog]);
            },
            buttons: [],
            autoFocus: true,
            width: width,
            height: height
        };
        o = $.extend({}, settings, Option);
        cenposDialog.inforMessageDialog(o);
        return cenposDialog;
    }
    function removeEventHandlers(panelHeader) {
        if (panelHeader == 'OIS215/B' || panelHeader == 'OIS215/D') {
            var elementNextButton = _$host.find('#Next');
            var elementCreateButton = _$host.find('.new');
            if (elementNextButton.length > 0) {
                ScriptUtil.RemoveEventHandler(elementNextButton, 'mouseDown.OIS215B');
                ScriptUtil.RemoveEventHandler(elementNextButton, 'click.OIS215BNext');
                ScriptUtil.RemoveEventHandler(elementNextButton, 'mouseDown.OIS215D');
                ScriptUtil.RemoveEventHandler(elementNextButton, 'click.OIS215D');
                elementNextButton.off('click.OIS215D');
            }
            if (elementCreateButton.length > 0) {
                ScriptUtil.RemoveEventHandler(elementCreateButton, 'click.OIS215BCreate');
            }
            ScriptUtil.RemoveEventHandler(_$host, 'keydown.OIS215B');
        }
        if (panelHeader == 'CRS435/E') {
            var buttonsElem = _$host.find('button');
            if (buttonsElem.length > 0) {
                for (var i = 0; i < buttonsElem.length; i++) {
                    var fkey = buttonsElem.eq(i).attr('fkey');
                    if (typeof fkey !== typeof undefined) {
                        if (fkey === 'F15' || fkey === 'F16') {
                            ScriptUtil.RemoveEventHandler(buttonsElem.eq(i), 'click.CRS435E');
                        }
                    }
                }
            }
        }
    }
    // Initial methods
    function getProgramDetails(_renderEngine) {
        var program = _renderEngine.ProgramName;
        var panelHeader = _renderEngine.PanelHeader;
        var panelLetter = panelHeader.substr(-1, 1);
        //debug("Program is: " + _program + ", panelHeader is: " + panelHeader + ", panelLetter is: " + panelLetter);
        if (program) {
            return true;
        }
        else {
            return false;
        }
    }
    function createElement(elemType, title, id) {
        var $tempElem = undefined;
        if (elemType === 'button') {
            var btn_elem = new ButtonElement();
            btn_elem.Value = title;
            $tempElem = ControlFactory.CreateButton(btn_elem);
        }
        else if (elemType === 'textBox') {
            // Specify textbox elem here...
        }
        return $tempElem;
    }
    function addElementToRowCol($host, $elem, row, col, width) {
        // Add custom style (i.e. where from the left to place the button)
        $elem.css({
            'position': 'absolute',
            'left': (parseInt(col) * 10) + 'px',
        });
        if (typeof width !== 'undefined') {
            $elem.css['width'] = width + 'px';
        }
        // Append the element to the UI
        $host.find('#pRow' + row).append($elem);
    }
    function showMessageDialog(msgType, msgTitle, msg, shortMsg) {
        $('body').inforMessageDialog({
            title: msgTitle,
            shortMessage: shortMsg,
            detailedMessage: msg,
            dialogType: msgType //Error, Information
        });
    }
    function callCenPos(cenPosQueryParams, inFields, preData, controller, panelHeader, inFieldsCRS435) {
        var url = undefined;
        if (typeof preData !== 'undefined' && typeof preData.ccInterFace !== 'undefined') {
            url = getValue(preData.ccInterFace, "URLA");
        }
        else if (inFieldsCRS435) {
            url = inFieldsCRS435.url;
        }
        else {
            throw Error("Both preData and inFieldsCRS435 can not be undefined, one of them must be defined");
        }
        if (typeof url === 'undefined' || url === null || url.length < 1 || !validURL(url)) {
            console.error("Invalid url to CenPos");
        }
        // Check last char
        if (url.slice(-1) !== '/') {
            url = url + '/?';
        }
        else {
            url = url + '?';
        }
        //var returnUrl = window.location.protocol + "//" + window.location.host + "/mne/apps/cenposdirect/";
        //var returnUrl = generateReturnUrl(controller);
        //var targetUrl = "https://www3.cenpos.net/posintegration/posintegration-html5/?" + encodeQueryData(cenPosQueryParams);
        var targetUrl = url + encodeQueryData(cenPosQueryParams);
        if (window.console) {
            var debugTargetUrl = targetUrl;
            debugTargetUrl = paramReplace("password", debugTargetUrl, "**********");
            debug("CenPos url: " + debugTargetUrl);
            debug("Return url: " + cenPosQueryParams.urlresponse);
        }
        openCenposDialog(encodeQueryData(cenPosQueryParams), url, controller, inFields, preData, panelHeader, inFieldsCRS435);
    }
    function generateReturnUrl(controller) {
        this.operationId = controller.GetInstanceId();
        var mneBase = document.location.protocol + "//" + document.location.host + "/mne/servlet/UserDataSvt";
        // Add parameters to the callback URL
        // Add names of the parameters that will contain data since the UserDataSvt is generic
        mneBase = mneBase + "?h5DataCategory=" + category +
            "&id=" + this.operationId +
            "&h5Title=" + encodeURIComponent("CenPos") +
            "&h5Message=" + encodeURIComponent("CenPos");
        return mneBase;
    }
    function validURL(str) {
        return /^(ftp|http|https):\/\/[^ "]+$/.test(str);
    }
    function prepareDataOIS215B(event) {
        if (event.which === 13 || event.ctrlKey && event.which === 49 || event.type === 'click') {
            var controller = event['paramData'].controller;
            var panelHeader = event['paramData'].panelHeader;
            var rcva = ScriptUtil.FindChild(_$host, "WSRCVA").val();
            rcva = rcva.replace(/,/g, ".").trim();
            var negative = (rcva.substr(rcva.length - 1) === "-");
            if (negative) {
                rcva = rcva.substr(0, rcva.length - 1);
            }
            var typeOfTransaction;
            var rcva_number = parseFloat(rcva);
            debug("Parsed rcva: " + rcva_number.toString());
            if (isNaN(rcva_number) || rcva_number === 0) {
                return;
            }
            if (rcva_number > 0.00 && !negative) {
                typeOfTransaction = 'sale';
            }
            else {
                typeOfTransaction = 'credit';
                // CenPos want this to be a positive number 
                rcva_number = Math.abs(rcva_number);
                debug("Credit amount: " + rcva_number.toString());
                rcva = rcva_number.toString();
            }
            var receipt = Boolean(ScriptUtil.GetFieldValue("WSSESL"));
            debug("Receipt prepData: " + receipt);
            var inFields = {
                RCVA: rcva,
                RCVA_Orig: ScriptUtil.GetFieldValue("WSRCVA").replace(/,/g, ".").trim(),
                PMNB: ScriptUtil.GetFieldValue("WSPMNB"),
                PYNO: ScriptUtil.GetFieldValue("WSPYNO"),
                TRDI: ScriptUtil.GetFieldValue("WS3RDI"),
                TRDP: ScriptUtil.GetFieldValue("WS3RDP"),
                CUCD: ScriptUtil.GetFieldValue("WSCUCD"),
                PYCD: ScriptUtil.GetFieldValue("WSPYCD"),
                CSHD: ScriptUtil.GetFieldValue("WSCSHD"),
                PYDT: ScriptUtil.GetFieldValue("WSPYDT"),
                email: ScriptUtil.GetFieldValue("WSEMAL"),
                receipt: receipt,
                typeOfTransaction: typeOfTransaction
            };
            listData(inFields, controller, panelHeader);
        }
    }
    function prepareDataOIS215D(event) {
        if (event.type === 'click') {
            var controller = event.data.controller;
            var panelHeader = event.data.panelHeader;
            var inFields = {
                RCVA: ScriptUtil.GetFieldValue("WEPMAM"),
                RCVA_Orig: ScriptUtil.GetFieldValue("WEPMAM").replace(/,/g, ".").trim(),
                PMNB: ScriptUtil.GetFieldValue("WEPMNB").trim(),
                PLNB: ScriptUtil.GetFieldValue("WEPLNB").trim(),
                PYNO: ScriptUtil.GetFieldValue("WEPYNO"),
                TRDI: ScriptUtil.GetFieldValue("WE3RDI"),
                TRDP: ScriptUtil.GetFieldValue("WE3RDP"),
                CUCD: ScriptUtil.GetFieldValue("LBL_L34T15"),
                PYCD: ScriptUtil.GetFieldValue("WEPYCD"),
                CSHD: '',
                IRNO: ScriptUtil.GetFieldValue("WEIRNO"),
                PYDT: ScriptUtil.GetFieldValue("WEPYDT"),
                typeOfTransaction: 'void'
            };
            listData(inFields, controller, panelHeader);
        }
    }
    function prepareDataCRS435E(event) {
        var controller = event['paramData'].controller;
        var panelHeader = event['paramData'].panelHeader;
        var amount = ScriptUtil.GetFieldValue("WECCAA");
        amount = amount.replace(/,/g, ".").trim();
        var negative = (amount.substr(amount.length - 1) === "-");
        if (negative) {
            amount = amount.substr(0, amount.length - 1);
        }
        var amount_number = parseFloat(amount);
        debug("Parsed amount: " + amount_number.toString());
        if (isNaN(amount_number) || amount_number === 0) {
            return;
        }
        var typeOfTransaction = ScriptUtil.GetFieldValue("WWTRTX");
        if (typeOfTransaction === "Authorize") {
            typeOfTransaction = "auth";
        }
        else if (typeOfTransaction === 'Credit') {
            typeOfTransaction = 'credit';
        }
        else {
            return;
        }
        var cucd = "";
        //var elem = _$host.find('#LBL_29T5');
        var elements = _$host.find('#pRow5 > div');
        if (elements.length > 0) {
            //debug('Elements found: '+elements.length);
            var elem = elements.eq(1).find('label');
            if (elem.length > 0) {
                //debug('Found label element');
                debug('Currency code from elem is: ' + elem.text());
                cucd = elem.text();
            }
        }
        get3PartyProvider(ScriptUtil.GetFieldValue("WE3RDI")).then(function (resp) {
            var inFieldsCRS435 = {
                address: ScriptUtil.GetFieldValue("WECUA1"),
                amount: amount,
                currencyCode: cucd,
                customercode: ScriptUtil.GetFieldValue("WEPYNO"),
                invoice: ScriptUtil.GetFieldValue("WWORNO"),
                merchantid: getValue(resp, "MEID"),
                modifyAVS: true,
                password: window.btoa(getValue(resp, "PWRD")),
                receipts: false,
                type: typeOfTransaction,
                userid: getValue(resp, "US65"),
                validateCookies: true,
                zip: ScriptUtil.GetFieldValue("WEPONO"),
                url: getValue(resp, "URLA")
            };
            setCenPosParamsAndCallCenPos(undefined, undefined, panelHeader, controller, inFieldsCRS435);
        }).fail(function () {
            if (window.console) {
                console.error("Failed to get predata from CRS435/E");
                return;
            }
        });
    }
    function listData(inFields, controller, panelHeader) {
        if (window.console) {
            debug("Payer: " + inFields.PYNO);
            debug("Recieved amount: " + inFields.RCVA);
        }
        if (!inFields.RCVA || !inFields.TRDI) {
            return;
        }
        // Get pre data via api calls to M3 to fetch data not displayed on screen
        if (panelHeader == 'OIS215/B') {
            getPreDataBPanel(inFields).then(function (preDataResponse) {
                setCenPosParamsAndCallCenPos(inFields, preDataResponse, panelHeader, controller, undefined);
            }).fail(function () {
                // Conditions not fulfilled, return
                return;
            });
        }
        if (panelHeader == 'OIS215/D') {
            getPreDataDPanel(inFields).then(function (preDataResponse) {
                setCenPosParamsAndCallCenPos(inFields, preDataResponse, panelHeader, controller, undefined);
            }).fail(function () {
                if (window.console) {
                    console.error("Failed to get predata from OIS215/D");
                }
            });
            return;
        }
    }
    /**
        * Set parmeters used by CenPos and call CenPos
        * @param inFields input fields from view
        * @param preDataResponse data from api calls fetching additional req data
        * @param panelHeader The panel header to be able to check from which panel the script is called
        * @param inFieldsCRS435 input fields from CRS435/E
        */
    function setCenPosParamsAndCallCenPos(inFields, preDataResponse, panelHeader, controller, inFieldsCRS435) {
        //var returnUrl = window.location.protocol + "//" + window.location.host + "/mne/apps/cenposdirect/";
        var returnUrl = generateReturnUrl(controller);
        var cenPos = {};
        var panelCalled = false;
        if (panelHeader == 'OIS215/B' && inFields) {
            panelCalled = true;
            cenPos.amount = inFields.RCVA.replace(/,/g, ".").trim();
            cenPos.invoice = inFields.PMNB;
            // No levelIIIData for credit transactions
            if (!preDataResponse) {
                throw Error("preDataResponse is undefined");
            }
            if (!preDataResponse.listLineCc) {
                throw Error("preDataResponse.listLineCc is undefined");
            }
            var sumVAT = 0.0;
            if (inFields.typeOfTransaction !== 'credit') {
                cenPos.levelIIIdata = window.btoa(createLevelIIIData(inFields, preDataResponse));
                for (var i = 0; i < preDataResponse.listLineCc.MIRecord.length; i++) {
                    sumVAT += parseFloat(getValue(preDataResponse.listLineCc, "VTAM", i));
                }
            }
            cenPos.taxamount = sumVAT.toString();
            cenPos.address = getValue(preDataResponse.payerData, "CUA1");
            cenPos.zip = getValue(preDataResponse.payerData, "PONO");
            cenPos.email = inFields.email;
            cenPos.receipts = inFields.receipt;
        }
        if (panelHeader == 'OIS215/D' && inFields) {
            panelCalled = true;
            cenPos.referencenumber = inFields.IRNO;
            if (preDataResponse && preDataResponse.detailsData) {
                cenPos.amount = getValue(preDataResponse.detailsData, "PMAM").replace(/,/g, ".").trim();
            }
        }
        if ((panelHeader == 'OIS215/B' || panelHeader == 'OIS215/D') && inFields) {
            panelCalled = true;
            var rcva_number = parseFloat(inFields.RCVA);
            cenPos.type = inFields.typeOfTransaction;
            cenPos.currencyCode = inFields.CUCD;
            cenPos.customercode = inFields.PYNO.trim();
            if (!preDataResponse) {
                throw Error("preDataResponse is undefined");
            }
            cenPos.merchantid = getValue(preDataResponse.ccInterFace, "MEID");
            cenPos.userid = getValue(preDataResponse.ccInterFace, "US65");
            cenPos.password = window.btoa(getValue(preDataResponse.ccInterFace, "PWRD"));
            cenPos.modifyAVS = true;
            cenPos.validateCookies = true;
        }
        if (panelHeader == 'CRS435/E' && inFieldsCRS435) {
            panelCalled = true;
            cenPos.type = inFieldsCRS435.type;
            cenPos.currencyCode = inFieldsCRS435.currencyCode;
            cenPos.amount = inFieldsCRS435.amount;
            cenPos.customercode = inFieldsCRS435.customercode;
            cenPos.userid = inFieldsCRS435.userid;
            cenPos.password = inFieldsCRS435.password;
            cenPos.merchantid = inFieldsCRS435.merchantid;
            cenPos.validateCookies = inFieldsCRS435.validateCookies;
            cenPos.invoice = inFieldsCRS435.invoice;
            cenPos.address = inFieldsCRS435.address;
            cenPos.receipts = inFieldsCRS435.receipts;
            cenPos.taxamount = inFieldsCRS435.taxamount;
            cenPos.zip = inFieldsCRS435.zip;
            cenPos.modifyAVS = inFieldsCRS435.modifyAVS;
        }
        if (!panelCalled) {
            throw Error("Did not find a suitable statement for panel header " + panelHeader);
        }
        cenPos.urlresponse = window.btoa(returnUrl);
        cenPos.RedirectType = "true";
        var queryData = encodeQueryData(cenPos);
        if (window.console) {
            debug("QueryData: ", paramReplace("password", decodeURIComponent(queryData), "************"));
        }
        callCenPos(cenPos, inFields, preDataResponse, controller, panelHeader, inFieldsCRS435);
    }
    /**
        * Create LevelIIIData
        * @param inFields Input fields from screen
        * @param preDataResponse Data loaded from api call to M3
        */
    function createLevelIIIData(inFields, preDataResponse) {
        if (!preDataResponse.listLineCc) {
            throw Error("preDataResponse.listLineCc can not be undefined");
        }
        var listLineCc = preDataResponse.listLineCc, headerData = preDataResponse.headerData, payerData = preDataResponse.payerData;
        var sumVAT = 0;
        for (var i = 0; i < listLineCc.MIRecord.length; i++) {
            sumVAT += parseFloat(getValue(listLineCc, "VTAM", i));
        }
        var xmlDoc = createXMLDocumentObject("LevelIIIData");
        if (!xmlDoc) {
            //debug("Failed to create an xml document");
            throw Error("Failed to create an xml document");
        }
        var headerElement = createElementValue(xmlDoc, "Header");
        headerElement.appendChild(createElementValue(xmlDoc, "CustomerCode", inFields.PYNO));
        headerElement.appendChild(createElementValue(xmlDoc, "ShiptofromZIPcode", getValue(payerData, "PONO")));
        headerElement.appendChild(createElementValue(xmlDoc, "Destinationcountrycode", getValue(payerData, "CSCD")));
        headerElement.appendChild(createElementValue(xmlDoc, "VATinvoicereferencenumber", inFields.PMNB));
        headerElement.appendChild(createElementValue(xmlDoc, "VATtaxamountrate", sumVAT.toString()));
        headerElement.appendChild(createElementValue(xmlDoc, "Freightshippingamount"));
        headerElement.appendChild(createElementValue(xmlDoc, "Dutyamount"));
        headerElement.appendChild(createElementValue(xmlDoc, "Orderdate", getValue(headerData, "PYDT").substring(2)));
        headerElement.appendChild(createElementValue(xmlDoc, "Discountamount"));
        var productsElement = createElementValue(xmlDoc, "Products");
        for (var j = 0; j < listLineCc.MIRecord.length; j++) {
            var productElement = createElementValue(xmlDoc, "product");
            productElement.appendChild(createElementValue(xmlDoc, "ItemCommodityCode", getValue(listLineCc, "EXIN", j)));
            productElement.appendChild(createElementValue(xmlDoc, "ItemDescription"));
            productElement.appendChild(createElementValue(xmlDoc, "ItemSequenceNumber"));
            productElement.appendChild(createElementValue(xmlDoc, "LineItemTotal", getValue(listLineCc, "PMAM", j)));
            productElement.appendChild(createElementValue(xmlDoc, "ProductCode"));
            productElement.appendChild(createElementValue(xmlDoc, "Quantity"));
            productElement.appendChild(createElementValue(xmlDoc, "Selected", "true"));
            productElement.appendChild(createElementValue(xmlDoc, "UnitCost"));
            productElement.appendChild(createElementValue(xmlDoc, "UnitofMeasureCode"));
            productsElement.appendChild(productElement);
        }
        var notesElement = createElementValue(xmlDoc, "Notes");
        notesElement.appendChild(createElementValue(xmlDoc, "Note"));
        // Attach all elements to document
        xmlDoc.documentElement.appendChild(headerElement);
        xmlDoc.documentElement.appendChild(productsElement);
        xmlDoc.documentElement.appendChild(notesElement);
        var output = new XMLSerializer().serializeToString(xmlDoc.documentElement);
        return output;
    }
    /**
        * Create a new element and add a value to the element
        * @param xmlDoc An xml document
        * @param element The name of the elemnt to create
        * @param value The value to add to the element, omitt to create a blank element
        */
    function createElementValue(xmlDoc, element, value) {
        var el = xmlDoc.createElement(element);
        if (typeof value !== 'undefined' && value !== null) {
            var textNode = xmlDoc.createTextNode(value);
            el.appendChild(textNode);
        }
        return el;
    }
    function encodeQueryData(data) {
        var ret = [];
        for (var d in data) {
            if (d === "email") {
                // CenPos returns error message if email address is URI encoded
                ret.push(encodeURIComponent(d) + "=" + data[d]);
            }
            else {
                ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
            }
        }
        return ret.join("&");
    }
    function getPreDataBPanel(inFields) {
        return getValidateCCData(inFields).then(function () {
            return getPayerInfo(inFields.PYNO).then(function (payerResponse) {
                return get3PartyProvider(inFields.TRDI).then(function (partyProviderResponse) {
                    return listCreditCardLines(inFields.PMNB, inFields.RCVA_Orig, inFields.typeOfTransaction).then(function (ccLinesResponse) {
                        if (!inFields.CSHD) {
                            throw Error("inFields.CSHD should not be undefined");
                        }
                        return getHeadValues(inFields.PMNB, inFields.CSHD).then(function (headValuesResponse) {
                            return { payerData: payerResponse, ccInterFace: partyProviderResponse, listLineCc: ccLinesResponse, headerData: headValuesResponse };
                        });
                    });
                });
            });
        });
    }
    function getPreDataDPanel(inFields) {
        return getPayerInfo(inFields.PYNO).then(function (payerResponse) {
            return get3PartyProvider(inFields.TRDI).then(function (partyProviderResponse) {
                if (!inFields.PLNB) {
                    throw Error("inFields.PLNB should not be undefined");
                }
                return getDetails(inFields.PMNB, inFields.PLNB).then(function (detailsResponse) {
                    inFields.CSHD = getValue(detailsResponse, "CSHD");
                    inFields.PYCD = getValue(detailsResponse, "PYCD");
                    if (inFields.CSHD === null || inFields.CSHD == "" || inFields.PYCD === null || inFields.PYCD == "") {
                        debug("Failed to get predata for d-panel");
                        throw Error("Failed to get predata for d-panel");
                    }
                    return getHeadValues(inFields.PMNB, inFields.CSHD).then(function (headValuesResponse) {
                        return { payerData: payerResponse, ccInterFace: partyProviderResponse, headerData: headValuesResponse, detailsData: detailsResponse };
                    });
                });
            });
        });
    }
    // Transactions related functions    
    function listCreditCardLines(pmnb, rcva, typeOfTransaction) {
        var deffered = $.Deferred();
        if (window.console) {
            debug('listCreditCardLines(): Getting lines...');
            debug('PMNB: ' + pmnb);
            debug('RCVA: ' + rcva);
        }
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/OIS215MI/LstLineCrCrd?PMNB=", pmnb, "&RCVA=", rcva].join(''),
            dataType: 'json',
        });
        retrieve.done(function (data) {
            // Can have empty data if credit transaction
            if (typeOfTransaction !== 'credit' && hasDataFromM3(data) || typeOfTransaction === 'credit') {
                if (window.console) {
                    debug('Received credit card lines data:', data);
                }
                deffered.resolve(data);
            }
            else {
                console.error("Failed to get any response: /m3api-rest/execute/OIS215MI/LstLineCrCrd ? PMNB = " + pmnb + " & RCVA=" + rcva, data);
                deffered.fail();
            }
        });
        retrieve.fail(function (err) {
            console.error("Failed to get any response: /m3api-rest/execute/OIS215MI/LstLineCrCrd ? PMNB = " + pmnb + " & RCVA=" + rcva, err);
            deffered.fail();
        });
        return deffered.promise();
    }
    function getPayerInfo(pyno) {
        var deffered = $.Deferred();
        if (window.console) {
            debug('getPayerInfo(): Getting payer info...');
        }
        var retrieve = $.ajax({
            url: "/m3api-rest/execute/CRS610MI/GetBasicData?CUNO=" + pyno,
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (hasDataFromM3(data)) {
                if (window.console) {
                    debug('Received payer data:', data);
                }
                deffered.resolve(data);
            }
            else {
                console.error("Failed to get any response: /m3api-rest/execute/CRS610MI/GetBasicData?CUNO=" + pyno, data);
                deffered.fail();
            }
        });
        retrieve.fail(function (err) {
            console.error("Failed to get any response: /m3api-rest/execute/CRS610MI/GetBasicData?CUNO=" + pyno, err);
            deffered.fail();
        });
        return deffered.promise();
    }
    function get3PartyProvider(trdi) {
        var deffered = $.Deferred();
        debug('get3PartyProvider(): Getting 3PartyProvider info...');
        debug("trdi: " + trdi);
        var retrieve = $.ajax({
            url: "/m3api-rest/execute/CRS434MI/Get3rdPartyId2?TRDI=" + trdi,
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (hasDataFromM3(data)) {
                if (window.console) {
                    debug('Received 3Party data:', data);
                }
                deffered.resolve(data);
            }
            else {
                console.error("Failed to get any response: /m3api-rest/execute/CRS434MI/Get3rdPartyId2?TRDI=" + trdi);
                deffered.fail();
            }
        });
        retrieve.fail(function () {
            console.error("Failed to get any response: /m3api-rest/execute/CRS434MI/Get3rdPartyId2?TRDI=" + trdi);
            deffered.fail();
        });
        return deffered.promise();
    }
    function getHeadValues(pmnb, cshd) {
        var deffered = $.Deferred();
        if (window.console) {
            debug('getHeadValues(): Get head values...');
            debug('PMNB: ' + pmnb);
            debug('CSHD: ' + cshd);
        }
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/OIS215MI/GetHeadValues?PMNB=", pmnb, "&CSHD=", cshd].join(''),
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (hasDataFromM3(data)) {
                if (window.console) {
                    debug('Received head values:', data);
                }
                deffered.resolve(data);
            }
            else {
                console.error(["Failed to get any response: /m3api-rest/execute/OIS215MI/GetHeadValues?PMNB=", pmnb, "&CSHD=", cshd].join('')), data;
                deffered.fail();
            }
        });
        retrieve.fail(function (err) {
            console.error(["Failed to get any response: /m3api-rest/execute/OIS215MI/GetHeadValues?PMNB=", pmnb, "&CSHD=", cshd].join(''), err);
            deffered.fail();
        });
        return deffered.promise();
    }
    function getDetails(pmnb, plnb) {
        var deffered = $.Deferred();
        if (window.console) {
            debug('getDetails(): Get details values...');
            debug('PMNB: ' + pmnb);
            debug('PLNB: ' + plnb);
        }
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/OIS215MI/GetDetails?PMNB=", pmnb, "&PLNB=", plnb].join(''),
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (hasDataFromM3(data)) {
                if (window.console) {
                    debug('Received datails values:', data);
                }
                deffered.resolve(data);
            }
            else {
                console.error(["Failed to get any response: /m3api-rest/execute/OIS215MI/GetDetails?PMNB=", pmnb, "&PLNB=", plnb].join('')), data;
                deffered.fail();
            }
        });
        retrieve.fail(function (err) {
            console.error(["Failed to get any response: /m3api-rest/execute/OIS215MI/GetDetails?PMNB=", pmnb, "&PLNB=", plnb].join(''), err);
            deffered.fail();
        });
        return deffered.promise();
    }
    function addPayment(inFields, preData, cenPosResponse) {
        if (window.console) {
            debug('CenPos response: ' + cenPosResponse);
            debug('addPayment(): Add payment...');
            debug('PMNB: ' + inFields.PMNB);
            debug('PYCD: ' + inFields.PYCD);
        }
        var pydt = getValue(preData.headerData, "PYDT");
        var pmam = getParameterByName(cenPosResponse, "amount");
        if (inFields.typeOfTransaction.toLowerCase() === 'credit') {
            pmam = ["-", pmam].join('');
        }
        var irno = getParameterByName(cenPosResponse, "referencenumber");
        var trty = (inFields.typeOfTransaction.toLowerCase() === 'sale'.toLowerCase()) ? 'S' : 'C';
        var ctpy = getParameterByName(cenPosResponse, "cardtype");
        var canu = getParameterByName(cenPosResponse, "cardnumber");
        var noca = getParameterByName(cenPosResponse, "nameoncard");
        if (window.console) {
            debug("TRTY: " + trty);
            debug("CTPY: " + ctpy);
            debug("CANU: " + canu);
            debug("NOCA: " + noca);
        }
        var promise = $.ajax({
            url: ["/m3api-rest/execute/OIS215MI/AddPayment?PMNB=", inFields.PMNB, "&CSHD=", inFields.CSHD, "&PYNO=", inFields.PYNO, "&PYCD=", inFields.PYCD, "&PYDT=", pydt, "&CUCD=", inFields.CUCD, "&PMAM=", pmam, "&IRNO=", irno,
                "&3RDI=", inFields.TRDI, "&3RDP=", inFields.TRDP, "&TRTY=", trty, "&CTPY=", ctpy, "&CANU=", canu, "&NOCA=", noca].join(''),
            dataType: 'json',
            success: function (data) {
                if (window.console) {
                    debug('Received add payment data:', data);
                }
                return data;
            },
            error: function (err) {
                if (window.console) {
                    console.error("Failed to upload data: /m3api-rest/execute/OIS215MI/AddPayment?PMNB=" + inFields.PMNB + "&CSHD=" + inFields.CSHD + "&PYNO=" + inFields.PYNO + "&PYCD=" + inFields.PYCD + "&PYDT=" + pydt + "&CUCD=" + inFields.CUCD + "&PMAM=" + pmam + "&IRNO=" + irno
                        + "&3RDI=" + inFields.TRDI + "&3RDP=" + inFields.TRDP + "&TRTY=" + trty + "&CTPY=" + ctpy + "&CANU=" + canu + "&NOCA=" + noca);
                }
                return;
            }
        });
        return promise;
    }
    function delLine(inFields) {
        if (window.console) {
            debug('delLine(): Delete line...');
            debug('PMNB: ' + inFields.PMNB);
            debug('PLNB: ' + inFields.PLNB);
        }
        var promise = $.ajax({
            url: ["/m3api-rest/execute/OIS215MI/DelLine?PMNB=", inFields.PMNB, "&PLNB=", inFields.PLNB].join(''),
            dataType: 'json',
            success: function (data) {
                if (window.console) {
                    debug('Delete line ok:', data);
                }
                return data;
            },
            error: function (err) {
                if (window.console) {
                    console.error(["Failed to delete line: /m3api-rest/execute/OIS215MI/DelLine?PMNB=", inFields.PMNB, "&PLNB=", inFields.PLNB].join(''));
                }
                return;
            }
        });
        return promise;
    }
    function addCenPosResult(inFields, cenPosResponse, messageId, messageData) {
        if (window.console) {
            debug('addCenPosResult(): Add3rdpResult...');
            debug('PMNB: ' + inFields.PMNB);
        }
        var url;
        if (cenPosResponse != null) {
            var refNo = getParameterByName(cenPosResponse, "referencenumber");
            if (refNo == null) {
                refNo = "";
            }
            var ccec = getParameterByName(cenPosResponse, "result");
            if (ccec === "undefined" || ccec === "null") {
                ccec = "-1";
            }
            url = ["/m3api-rest/execute/OIS215MI/Add3rdpResult?PMNB=", inFields.PMNB, "&CCEC=", ccec, "&MSGE=", getParameterByName(cenPosResponse, "message"), "&IRNO=", refNo].join('');
        }
        else {
            if (messageId != null) {
                url = ["/m3api-rest/execute/OIS215MI/Add3rdpResult?PMNB=", inFields.PMNB, "&MSID=", messageId].join('');
            }
            else {
                throw Error("cenPosResponse or messageId must be defined");
            }
        }
        var promise = $.ajax({
            url: url,
            dataType: 'json',
            success: function (data) {
                if (window.console) {
                    debug('Add3rdpResult ok:', data);
                }
                return data;
            },
            error: function (err) {
                if (window.console) {
                    console.error("Failed to add 3rdpResult: " + url);
                }
                return;
            }
        });
        return promise;
    }
    function getValidateCCData(inFields) {
        var deffered = $.Deferred();
        if (window.console) {
            debug('getValidateCCData(): Get ValidateCCData values...');
            debug('PYDT: ' + inFields.PYDT);
        }
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/OIS215MI/ValidateCCData?PMNB=", inFields.PMNB, "&CSHD=", inFields.CSHD, "&PYNO=", inFields.PYNO, "&PYDT=", inFields.PYDT, "&CUCD=", inFields.CUCD, "&PYCD=", inFields.PYCD, "&PMAM=", inFields.RCVA_Orig].join(''),
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (window.console) {
                debug('Received ValidateCCData values:', data);
            }
            if (data === undefined || data === null) {
                deffered.resolve();
            }
            else {
                if (data.hasOwnProperty('@type') && data['@type'] === 'ServerReturnedNOK') {
                    deffered.fail();
                }
                else {
                    deffered.resolve();
                }
            }
        });
        retrieve.fail(function (err) {
            console.error(["/m3api-rest/execute/OIS215MI/ValidateCCData?PMNB=", inFields.PMNB, "&CSHD=", inFields.CSHD, "&PYNO=", inFields.PYNO, "&PYDT=", inFields.PYDT, "&CUCD=", inFields.CUCD, "&PYCD=", inFields.PYCD, "&PMAM=", inFields.RCVA_Orig].join(''), err);
            deffered.fail();
        });
        return deffered.promise();
    }
    function addCCRefNo(inFieldsCRS435, cenPosResponse) {
        var deffered = $.Deferred();
        var userDIVI = ScriptUtil.GetUserContext().CurrentDivision;
        var stat = getParameterByName(cenPosResponse, "result");
        var result = parseInt(stat);
        if (!isNaN(result)) {
            if (result === 0) {
                if (inFieldsCRS435.type === "credit") {
                    stat = "90";
                }
                else {
                    stat = "20";
                }
            }
            else if (result < 99 || result > 115 && result < 996 || result > 999) {
                stat = "15";
            }
            else {
                stat = "10";
            }
        }
        else {
            stat = "15";
        }
        var trty = (inFieldsCRS435.type.toLowerCase() === 'auth'.toLowerCase()) ? 'A' : 'C';
        if (window.console) {
            debug('addCCRefNo(): Add AddCCRefNo values...');
            debug(["/m3api-rest/execute/CRCCINMI/AddCCRefNo?DIVI=", userDIVI, "&3RDP=", ScriptUtil.GetFieldValue("WW3RDP"), "&RORC=", "3", "&CCEC=", getParameterByName(cenPosResponse, "result"), "&MSG1=", getParameterByName(cenPosResponse, "message"), "&CCAA=", getParameterByName(cenPosResponse, "amount"),
                "&CANU=", getParameterByName(cenPosResponse, "cardnumber"), "&CTPY=", getParameterByName(cenPosResponse, "cardtype"), "&STAT=", stat, "&REFE=", getParameterByName(cenPosResponse, "referencenumber"), "&TRTY=", trty, "&CUCD=", inFieldsCRS435.currencyCode, "&3RDI=", ScriptUtil.GetFieldValue("WE3RDI"),
                "&NOCA=", getParameterByName(cenPosResponse, "nameoncard"), "&ORNO=", ScriptUtil.GetFieldValue("WWORNO")].join(''));
            //            debug('PLNB: ' + plnb);
        }
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/CRCCINMI/AddCCRefNo?DIVI=", userDIVI, "&3RDP=", ScriptUtil.GetFieldValue("WW3RDP"), "&RORC=", "3", "&CCEC=", getParameterByName(cenPosResponse, "result"), "&MSG1=", getParameterByName(cenPosResponse, "message"), "&CCAA=", getParameterByName(cenPosResponse, "amount"),
                "&CANU=", getParameterByName(cenPosResponse, "cardnumber"), "&CTPY=", getParameterByName(cenPosResponse, "cardtype"), "&STAT=", stat, "&REFE=", getParameterByName(cenPosResponse, "referencenumber"), "&TRTY=", trty, "&CUCD=", inFieldsCRS435.currencyCode, "&3RDI=", ScriptUtil.GetFieldValue("WE3RDI"),
                "&NOCA=", getParameterByName(cenPosResponse, "nameoncard"), "&ORNO=", ScriptUtil.GetFieldValue("WWORNO")].join(''),
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (hasDataFromM3(data)) {
                if (window.console) {
                    debug('Received AddCCRefNo response:', data);
                }
                deffered.resolve(data);
            }
            else {
                console.error(["Failed to get any response: /m3api-rest/execute/CRCCINMI/AddCCRefNo?DIVI=", userDIVI, "&3RDP=", ScriptUtil.GetFieldValue("WW3RDP"), "&RORC=", "3", "&CCEC=", getParameterByName(cenPosResponse, "result"), "&MSG1=", getParameterByName(cenPosResponse, "message"), "&CCAA=", getParameterByName(cenPosResponse, "amount"),
                    "&CANU=", getParameterByName(cenPosResponse, "cardnumber"), "&CTPY=", getParameterByName(cenPosResponse, "cardtype"), "&STAT=", stat, "&REFE=", getParameterByName(cenPosResponse, "referencenumber"), "&TRTY=", trty, "&CUCD=", inFieldsCRS435.currencyCode, "&TRDI=", ScriptUtil.GetFieldValue("WE3RDI"),
                    "&NOCA=", getParameterByName(cenPosResponse, "nameoncard"), "&ORNO=", ScriptUtil.GetFieldValue("WWORNO")].join('')), data;
                deffered.fail();
            }
        });
        retrieve.fail(function (err) {
            console.error(["Failed to get any response: /m3api-rest/execute/CRCCINMI/AddCCRefNo?DIVI=", userDIVI, "&3RDP=", ScriptUtil.GetFieldValue("WW3RDP"), "&RORC=", "3", "&CCEC=", getParameterByName(cenPosResponse, "result"), "&MSG1=", getParameterByName(cenPosResponse, "message"), "&CCAA=", getParameterByName(cenPosResponse, "amount"),
                "&CANU=", getParameterByName(cenPosResponse, "cardnumber"), "&CTPY=", getParameterByName(cenPosResponse, "cardtype"), "&STAT=", stat, "&REFE=", getParameterByName(cenPosResponse, "referencenumber"), "&TRTY=", trty, "&CUCD=", inFieldsCRS435.currencyCode, "&TRDI=", ScriptUtil.GetFieldValue("WE3RDI"),
                "&NOCA=", getParameterByName(cenPosResponse, "nameoncard"), "&ORNO=", ScriptUtil.GetFieldValue("WWORNO")].join('')), err;
            deffered.fail();
        });
        return deffered.promise();
    }
    function getValue(data, fieldName, recordNo) {
        if (recordNo === undefined) {
            recordNo = 0;
        }
        if (!data.hasOwnProperty('MIRecord') || data.MIRecord.length < 1) {
            // No result found
            throw Error("No result found");
        }
        var nameValue = data.MIRecord[recordNo].NameValue;
        for (var i = 0; i < nameValue.length; i++) {
            if (nameValue[i].Name === fieldName) {
                return nameValue[i].Value.trim();
            }
        }
        if (window.console) {
            debug("Field " + fieldName + " was not found", data.MIRecord[recordNo].NameValue);
        }
        throw Error("Field " + fieldName + " was not found");
    }
    function showSlideInMessage(msgType, msgTitle, msg) {
        $('body').inforSlideInMessage({
            autoDismiss: true,
            messageType: msgType,
            messageTitle: msgTitle,
            message: msg
        });
    }
    function addDialogWindow() {
        //First add the html to the page..
        var customHtml = '<div id="myCustomDiv">' +
            '<input id="myInputField" type="text"><br/>' +
            '</div>';
        // Add the custom div to host
        _$host.append(customHtml);
        //Invoke the dialog on it
        $('#myCustomDiv').inforMessageDialog({
            title: "Add input value",
            dialogType: "General",
            width: 300,
            height: "auto",
            modal: true,
            beforeClose: function () {
                //do something and return false to cancel closing
            },
            close: function (event, ui) {
                $('#updatedItemsDiv').remove();
            },
            buttons: [{
                    id: 'submitBtn',
                    text: 'Submit',
                    click: function () {
                        debug('Input value:', $('#myInputField').val());
                        $(this).inforDialog("close");
                    },
                    isDefault: true
                }]
        });
    }
    function disableH5Client() {
        $("body").inforBusyIndicator({ delay: 300, modal: true });
    }
    function enableH5Client(controller, panelHeader) {
        $("body").inforBusyIndicator("close");
        if (panelHeader == 'OIS215/B' || panelHeader == 'OIS215/D') {
            controller.isProcessing = false;
            controller.NextOption('KEY', false);
        }
    }
    function counter(args) {
        var controller = args[0];
        var inFields = args[1];
        var preData = args[2];
        var panelHeader = args[3];
        var inFieldsCRS435 = args[4];
        var cenposIframe = args[5];
        var cenposDialog = args[6];
        if (cenposIframe[0].contentWindow) {
            if (cenposIframe[0].contentWindow.location.host == document.location.host) {
                var cenPosResponse_1 = cenposIframe[0].contentWindow.location.href;
                clearInterval(Timer);
                cenposDialog.inforDialog("close");
                if (panelHeader == 'OIS215/B' || panelHeader == 'OIS215/D') {
                    addCenPosResult(inFields, cenPosResponse_1).then(function () {
                        if (panelHeader == 'OIS215/B') {
                            if (getParameterByName(cenPosResponse_1, "result") === "0") {
                                addPayment(inFields, preData, cenPosResponse_1).then(function (resp) {
                                    controller.PressKey("F5");
                                    ScriptUtil.SetFieldValue("WSRCVA", "");
                                });
                            }
                            ;
                        }
                        if (panelHeader == 'OIS215/D') {
                            if (getParameterByName(cenPosResponse_1, "result") === "0") {
                                delLine(inFields).then(function (resp) {
                                    debugger;
                                    controller.PressKey("F5");
                                });
                                controller.PressKey("F5");
                            }
                            ;
                        }
                    });
                }
                else if (panelHeader == 'CRS435/E') {
                    addCCRefNo(inFieldsCRS435, cenPosResponse_1).then(function (resp) {
                        //ScriptUtil.SetFieldValue("WESTAT", getValue(resp, "STAT"));
                        //ScriptUtil.SetFieldValue("WWNREF", getValue(resp, "REFN"));
                        //ScriptUtil.SetFieldValue("WEREFE", getParameterByName(cenPosResponse, "referencenumber"));
                        //ScriptUtil.SetFieldValue("WECCEC", getParameterByName(cenPosResponse, "result"));
                        //ScriptUtil.SetFieldValue("WEMSG1", getParameterByName(cenPosResponse, "message"));
                        controller.PressKey("F5");
                    });
                }
                if (window.console) {
                    debug("CenPos result code: " + getParameterByName(cenPosResponse_1, "result"));
                    debug("CenPos result message: " + getParameterByName(cenPosResponse_1, "message"));
                }
            }
        }
    }
    function getParameterByName(locationSearch, name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(locationSearch);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    /**
        * Create XML document in IE
        */
    function createMSXMLDocumentObject() {
        if (typeof (ActiveXObject) != "undefined") {
            var progIDs = [
                "Msxml2.DOMDocument.6.0",
                "Msxml2.DOMDocument.5.0",
                "Msxml2.DOMDocument.4.0",
                "Msxml2.DOMDocument.3.0",
                "MSXML2.DOMDocument",
                "MSXML.DOMDocument"
            ];
            for (var i = 0; i < progIDs.length; i++) {
                try {
                    return new ActiveXObject(progIDs[i]);
                }
                catch (e) { }
                ;
            }
        }
        return null;
    }
    /**
        * Create xml document
        * @param rootName The root
        */
    function createXMLDocumentObject(rootName) {
        if (!rootName) {
            rootName = "";
        }
        var xmlDoc = createMSXMLDocumentObject();
        if (xmlDoc) {
            if (rootName) {
                var rootNode = xmlDoc.createElement(rootName);
                xmlDoc.appendChild(rootNode);
            }
        }
        else {
            if (document.implementation.createDocument) {
                xmlDoc = document.implementation.createDocument("", rootName, null);
            }
        }
        return xmlDoc;
    }
    function hasDataFromM3(miRecordResponse) {
        if (!miRecordResponse.hasOwnProperty('MIRecord') || miRecordResponse.MIRecord.length <= 0) {
            return false;
        }
        return true;
    }
    /**
     * Update the appropriate href query string parameter
     * @param name The name of the parameter with the value to update
     * @param href The href containing the query parameters
     * @param value The new parameter value
     */
    function paramReplace(name, href, value) {
        // Find the param with regex
        // Grab the first character in the returned string (should be ? or &)
        // Replace our href string with our new value, passing on the name and delimeter
        var re = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var regExArray = re.exec(href);
        if (regExArray !== null) {
            var delimeter = regExArray[0].charAt(0);
            var newString = href.replace(re, delimeter + name + "=" + value);
            return newString;
        }
        //var re = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        //    delimeter = re.exec(href)[0].charAt(0),
        //    newString = href.replace(re, delimeter + name + "=" + value);
        throw Error("Unable to replace the value of parameter " + name + " in string");
    }
};
//# sourceMappingURL=CenPosM3_v4.js.map