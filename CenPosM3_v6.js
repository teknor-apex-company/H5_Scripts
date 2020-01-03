/**
 * Use and manage tokens when calling CenPos
 * Last modified 2019-06-19
 */
var CenPosM3_v6 = new function () {
    var category = "CenPosM3_v6";
    var _$host;
    var Child;
    var Timer;
    var debug;
    var isDebug;
    var fnBind;
    var tokensEndpoint;
    var tokensEnabled = false;
    this.grid;
    var PaymentType;
    (function (PaymentType) {
        PaymentType[PaymentType["Cash"] = 0] = "Cash";
        PaymentType[PaymentType["Card"] = 1] = "Card";
        PaymentType[PaymentType["Token"] = 2] = "Token";
    })(PaymentType || (PaymentType = {}));
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
        tokensEndpoint = _args;
        if (tokensEndpoint) {
            tokensEnabled = true;
        }
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
        else if (panelHeader == 'CRS610/J' && tokensEnabled) {
            addMantainCardsButton(_controller);
            var maintainCardsButton = undefined;
            var buttonsElem = _$host.find('button');
            if (buttonsElem.length > 0) {
                for (var i = 0; i < buttonsElem.length; i++) {
                    if (buttonsElem.eq(i).length > 0) {
                        if (buttonsElem.eq(i)[0].innerText == Lang.Token.MaintainLodgedCards) {
                            maintainCardsButton = buttonsElem.eq(i);
                            break;
                        }
                    }
                }
            }
            if (maintainCardsButton && maintainCardsButton.length > 0) {
                ScriptUtil.AddEventHandler(maintainCardsButton, 'click.CRS610J', prepareDataCRS610J, { controller: _controller, panelHeader: panelHeader });
            }
        }
        else if (panelHeader == 'CRS315/E') {
            addAccountPaymentButton(_controller);
            var accountPayment = undefined;
            var buttonsElem = _$host.find('button');
            if (buttonsElem.length > 0) {
                for (var i = 0; i < buttonsElem.length; i++) {
                    if (buttonsElem.eq(i).length > 0) {
                        if (buttonsElem.eq(i)[0].innerText == Lang.AccountPayment.AccountPayment) {
                            accountPayment = buttonsElem.eq(i);
                            break;
                        }
                    }
                }
            }
            if (accountPayment && accountPayment.length > 0) {
                accountPayment.addClass('default');
                ScriptUtil.AddEventHandler(accountPayment, 'click.CRS315E', prepareAccountPaymentData, { controller: _controller, panelHeader: panelHeader });
            }
        }
    };
    function openCenposDialog(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken) {
        // Load first all the required cenpos script
        var $this = this;
        ScriptUtil.LoadScript("https://code.jquery.com/jquery-migrate-1.2.1.min.js", function (data) {
            ScriptUtil.LoadScript("https://www.cenpos.com/Plugins/porthole.min.js", function (data) {
                ScriptUtil.LoadScript("https://www.cenpos.com/Plugins/jquery.cenpos.2.3.post.js", function (data) {
                    run(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken);
                });
            });
        });
    }
    ;
    function isPaymentPanel(panelHeader) {
        return panelHeader == 'CRS435/E' || panelHeader == 'OIS215/B' || panelHeader == 'CRS315/E';
    }
    function isCardMaintenancePanel(panelHeader) {
        return panelHeader == 'CRS610/J';
    }
    function run(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken) {
        if (isPaymentPanel(panelHeader) || isCardMaintenancePanel(panelHeader)) {
            if (tokensEnabled) {
                getCardTokens(inFieldsToken).then(function (result) {
                    var tokens = result.tokenResult.tokens;
                    if (result.tokenResult.tokens.length > 0) {
                        return getUseCardTokenDialog(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, tokens, inFieldsToken);
                    }
                    else {
                        if (isPaymentPanel(panelHeader)) {
                            return getCenposAuthDialog(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken);
                        }
                        else if (isCardMaintenancePanel(panelHeader)) {
                            var onClosedOk = function () {
                                return getCenposAuthDialog(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken);
                            };
                            showConfirmDialog("Question", Lang.Token.ManageCCInfo, Lang.Token.AddCCInfo, onClosedOk);
                        }
                    }
                });
            }
            else {
                return getCenposAuthDialog(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken);
            }
        }
        else {
            return getCenposAuthDialog(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken);
        }
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
        if (panelHeader == 'CRS610/J') {
            var buttonsElem = _$host.find('button');
            if (buttonsElem.length > 0) {
                for (var i = 0; i < buttonsElem.length; i++) {
                    if (buttonsElem.eq(i).length > 0) {
                        if (buttonsElem.eq(i)[0].innerText == Lang.Token.MaintainLodgedCards) {
                            ScriptUtil.RemoveEventHandler(buttonsElem.eq(i), 'click.CRS610J');
                            break;
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
    function callCenPos(cenPosQueryParams, inFields, preData, controller, panelHeader, inFieldsCRS435, inFieldsToken) {
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
        openCenposDialog(encodeQueryData(cenPosQueryParams), url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken);
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
                typeOfTransaction = 'Sale';
            }
            else {
                typeOfTransaction = 'Credit';
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
            typeOfTransaction = "Auth";
        }
        else if (typeOfTransaction === 'Credit') {
            typeOfTransaction = 'Credit';
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
        var customerCode = ScriptUtil.GetFieldValue("WEPYNO");
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
                url: getValue(resp, "URLA"),
            };
            getPayerEmail(customerCode).then(function (email) {
                inFieldsCRS435.email = email;
            }).always(function () {
                setCenPosParamsAndCallCenPos(undefined, undefined, panelHeader, controller, inFieldsCRS435);
            });
        }).fail(function () {
            if (window.console) {
                console.error("Failed to get predata from CRS435/E");
                return;
            }
        });
    }
    function prepareDataCRS610J(event) {
        var controller = event['paramData'].controller;
        var panelHeader = event['paramData'].panelHeader;
        var typeOfTransaction = "CreateToken";
        var currencyCode = ScriptUtil.GetFieldValue("WRCUCD");
        var thirdPartyProvider = "CenPOS";
        var customerCode = ScriptUtil.GetFieldValue("WWCUNO");
        return getPayerInfo(customerCode).then(function (payerResponse) {
            var address = getValue(payerResponse, "CUA1");
            var zip = getValue(payerResponse, "PONO");
            get3PartyProvider(thirdPartyProvider).then(function (resp) {
                var inFieldsCRS435 = {
                    address: address,
                    currencyCode: currencyCode,
                    customercode: customerCode,
                    invoice: customerCode,
                    merchantid: getValue(resp, "MEID"),
                    modifyAVS: true,
                    password: window.btoa(getValue(resp, "PWRD")),
                    receipts: false,
                    type: typeOfTransaction,
                    userid: getValue(resp, "US65"),
                    validateCookies: true,
                    url: getValue(resp, "URLA"),
                    zip: zip
                };
                getPayerEmail(customerCode).then(function (email) {
                    inFieldsCRS435.email = email;
                }).always(function () {
                    setCenPosParamsAndCallCenPos(undefined, undefined, panelHeader, controller, inFieldsCRS435);
                });
            }).fail(function () {
                if (window.console) {
                    console.error("Failed to get predata from CRS610/J");
                    return;
                }
            });
        });
    }
    function showConfirmDialog(dialogType, header, message, onClosedOk) {
        var prop = {
            header: header,
            message: message,
            dialogType: dialogType,
        };
        if (onClosedOk)
            prop["closed"] = function (choice) {
                if (choice.ok) {
                    onClosedOk();
                }
            };
        ConfirmDialog.ShowMessageDialog(prop);
    }
    function callAccountPaymentSubmitActions(payment, controller, inFields, preData, cenPosResponse, inFieldsToken) {
        return addOnAccount(inFields).then(function (addOnAccountResp) {
            return addPayment(inFields, preData, cenPosResponse).then(function (addPaymentResp) {
                return validate(inFields).then(function (validateResp) {
                    controller.PressKey("F5");
                    H5ControlUtil.H5Dialog.DestroyDialog($('.accountPaymentDialog'));
                    if (tokensEnabled && (payment == PaymentType.Card)) {
                        var message = Lang.AccountPayment.AccountPayment + " " + Lang.AccountPayment.Successful + ". " + Lang.Token.SaveCCInfo;
                        var onClosedOk = function () {
                            addCardToken(inFieldsToken, cenPosResponse.referencenumber);
                        };
                        showConfirmDialog("Question", Lang.Token.SaveToken, message, onClosedOk);
                    }
                    else {
                        showConfirmDialog("Information", Lang.AccountPayment.AccountPayment, Lang.AccountPayment.AccountPayment + " " + Lang.AccountPayment.Successful);
                    }
                });
            });
        });
    }
    function startAccountPayment(inFieldsCRS435, controller, panelHeader) {
        var cashDeskHead = $("#cashDeskDropDown").children(":selected").attr("id");
        var voucherText = $("#voucherText").getValue();
        var paymentMethod = $("#paymentMethodDropDown").getValue();
        addPaymentNo(cashDeskHead).then(function (addPaymentNoResp) {
            var paymentNo = getValue(addPaymentNoResp, "PMNB");
            var currency = ScriptUtil.GetFieldValue("WKCUCD");
            var payer = ScriptUtil.GetFieldValue("WAPYNO");
            var date = new Date();
            var year = date.getFullYear().toString();
            var month = (Number(date.getMonth()) + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
            var day = Number(date.getDate()) < 10 ? "0" + (date.getDate()) : (date.getDate());
            var paymentDate = year + month + day;
            var inFields = {
                RCVA: $("#toPayInput").val().trim(),
                RCVA_Orig: $("#toPayInput").val().replace(/,/g, ".").trim(),
                PMNB: paymentNo,
                PYCD: paymentMethod,
                PYDT: paymentDate,
                PYNO: ScriptUtil.GetFieldValue("WAPYNO"),
                TRDI: "CenPOS",
                TRDP: "CenPos",
                CSHD: cashDeskHead,
                CUCD: ScriptUtil.GetFieldValue("WKCUCD"),
                typeOfTransaction: 'Sale',
                VTXT: voucherText,
                YEA4: year
            };
            var selectedPaymentClass = $("#paymentMethodDropDown").children(":selected").attr("value");
            if (Number(selectedPaymentClass) == 3) {
                setCenPosParamsAndCallCenPos(inFields, undefined, panelHeader, controller, inFieldsCRS435);
            }
            else {
                disableH5Client();
                callAccountPaymentSubmitActions(PaymentType.Cash, controller, inFields).always(function () {
                    enableH5Client();
                });
            }
        });
    }
    function prepareDataCRS315E(event) {
        var controller = event['paramData'].controller;
        var panelHeader = event['paramData'].panelHeader;
        var amount = $("#toPayInput").val().replace(/,/g, ".").trim();
        var typeOfTransaction = "Sale";
        var currencyCode = ScriptUtil.GetFieldValue("WKCUCD");
        var thirdPartyProvider = "CenPOS";
        var customerCode = ScriptUtil.GetFieldValue("WAPYNO");
        return getPayerInfo(customerCode).then(function (payerResponse) {
            var address = getValue(payerResponse, "CUA1");
            var zip = getValue(payerResponse, "PONO");
            get3PartyProvider(thirdPartyProvider).then(function (resp) {
                var inFieldsCRS435 = {
                    address: address,
                    amount: amount,
                    currencyCode: currencyCode,
                    customercode: customerCode,
                    invoice: customerCode,
                    merchantid: getValue(resp, "MEID"),
                    modifyAVS: true,
                    password: window.btoa(getValue(resp, "PWRD")),
                    receipts: false,
                    type: typeOfTransaction,
                    userid: getValue(resp, "US65"),
                    validateCookies: true,
                    url: getValue(resp, "URLA"),
                    zip: zip
                };
                getPayerEmail(customerCode).then(function (email) {
                    inFieldsCRS435.email = email;
                }).always(function () {
                    startAccountPayment(inFieldsCRS435, controller, panelHeader);
                });
            }).fail(function () {
                if (window.console) {
                    console.error("Failed to get predata from CRS315/E");
                    return;
                }
            });
        });
    }
    function getValueFromMiRecord(miRecord, name) {
        for (var _i = 0, _a = miRecord.NameValue; _i < _a.length; _i++) {
            var field = _a[_i];
            if (field["Name"] == name) {
                return field["Value"].trim();
            }
        }
        debug("Cannot get field: " + name + " from MIRecord");
        return "";
    }
    function createPositionElement(width, top, left, height) {
        var position = new PositionElement();
        position.Width = width;
        position.Top = top;
        position.Left = left;
        if (height)
            position.Height = height;
        return position;
    }
    function createLabel(text, color, id) {
        var prop = { "text": text };
        if (color)
            prop["style"] = "color: " + color;
        if (id)
            prop["id"] = id;
        var $label = $("<label>", prop);
        return $label;
    }
    function createDropDown(id, onchange) {
        var dropDown = $("<select>", {
            "class": "inforDropDownList",
            "id": id,
            "height": "25px"
        });
        dropDown.on('change', onchange);
        return dropDown;
    }
    function fillCashDeskDropDown(cashDeskDropDown, cashDeskDropDownEntries, dialogContentElem) {
        if (cashDeskDropDownEntries.length > 1) {
            var $entry = $("<option>");
            cashDeskDropDown.append($entry);
        }
        for (var _i = 0, cashDeskDropDownEntries_1 = cashDeskDropDownEntries; _i < cashDeskDropDownEntries_1.length; _i++) {
            var cashDeskEntry = cashDeskDropDownEntries_1[_i];
            var $entry = $("<option>", {
                "id": cashDeskEntry["id"],
                "text": cashDeskEntry["label"]
            });
            cashDeskDropDown.append($entry);
        }
        if (cashDeskDropDownEntries.length == 1) {
            fillPaymentMethod(cashDeskDropDownEntries[0].id, dialogContentElem);
        }
        cashDeskDropDown.inforDropDownList();
    }
    function createCashDeskElements(dialogContentElem, cashDeskDropDownEntries) {
        var $cashDeskLabel = createLabel(Lang.AccountPayment.SelectCashDesk);
        $cashDeskLabel.Position = createPositionElement("90%", "70", "30");
        dialogContentElem.Add($cashDeskLabel);
        var $cashDeskRequired = createLabel("*", "red", "cashDeskRequired");
        $cashDeskRequired.Position = createPositionElement("90%", "70", "130");
        dialogContentElem.Add($cashDeskRequired);
        var cashDesk;
        var onCashDeskChange = function () {
            var selectedCashDeskId = $cashDeskDropDown.children(":selected").attr("id");
            if (cashDesk !== selectedCashDeskId) {
                cashDesk = selectedCashDeskId;
                if (selectedCashDeskId) {
                    fillPaymentMethod(selectedCashDeskId, dialogContentElem);
                }
                else {
                    clearPaymentMethod();
                }
            }
            if (selectedCashDeskId != undefined) {
                $('#cashDeskRequired').text("*");
            }
        };
        var $cashDeskDropDown = createDropDown("cashDeskDropDown", onCashDeskChange);
        $cashDeskDropDown.Position = createPositionElement("190%", "92.5", "30");
        dialogContentElem.Add($cashDeskDropDown);
        fillCashDeskDropDown($cashDeskDropDown, cashDeskDropDownEntries, dialogContentElem);
    }
    function createPaymentMethodElements(dialogContentElem) {
        var $paymentMethodLabel = createLabel(Lang.AccountPayment.SelectPaymentMethod);
        $paymentMethodLabel.Position = createPositionElement("90%", "140", "30");
        dialogContentElem.Add($paymentMethodLabel);
        var $paymentMethodRequired = createLabel("*", "red", "paymentMethodRequired");
        $paymentMethodRequired.Position = createPositionElement("90%", "140", "162.5");
        dialogContentElem.Add($paymentMethodRequired);
        var onPaymentMethodChange = function () {
            var selectedPaymentMethod = $("#paymentMethodDropDown").children(":selected").attr("id");
            if (selectedPaymentMethod != undefined) {
                $('#paymentMethodRequired').text("*");
            }
        };
        var $paymentMethodDropDown = createDropDown("paymentMethodDropDown", onPaymentMethodChange);
        $paymentMethodDropDown.Position = createPositionElement("190%", "162.5", "30");
        dialogContentElem.Add($paymentMethodDropDown);
        $paymentMethodDropDown.inforDropDownList();
    }
    function createToPayElements(dialogContentElem) {
        var $toPayLabel = createLabel(Lang.AccountPayment.ToPay);
        $toPayLabel.Position = createPositionElement("90%", "210", "30");
        dialogContentElem.Add($toPayLabel);
        var $toPayValidate = createLabel("*", "red", "toPayValidate");
        $toPayValidate.Position = createPositionElement("90%", "210", "75");
        dialogContentElem.Add($toPayValidate);
        var outstandingBalance = ScriptUtil.GetFieldValue("WKTOIN");
        var $toPayInput = $("<input>", {
            "class": "inforTextbox",
            "id": "toPayInput",
            "style": "height: 20px; padding: 3px; text-align: right; background-color: white !important",
            "type": "text",
            "value": outstandingBalance.indexOf("-") != -1 ? 0 : outstandingBalance
        });
        $toPayInput.Position = createPositionElement("265", "232.5", "30");
        dialogContentElem.Add($toPayInput);
        var $currencyLabel = createLabel(ScriptUtil.GetFieldValue("WKCUCD"));
        $currencyLabel.Position = createPositionElement("90%", "240", "310");
        dialogContentElem.Add($currencyLabel);
    }
    function createVoucherTextElements(dialogContentElem) {
        var $voucherLabel = createLabel(Lang.AccountPayment.VoucherText);
        $voucherLabel.Position = createPositionElement("90%", "290", "10");
        dialogContentElem.Add($voucherLabel);
        var $voucherTextRequired = createLabel("*", "red", "voucherTextRequired");
        $voucherTextRequired.Position = createPositionElement("90%", "290", "85");
        dialogContentElem.Add($voucherTextRequired);
        var $voucherText = $("<textarea>", {
            "class": "inforTextArea",
            "id": "voucherText",
            "maxlength": "40",
            "style": "padding,: 2px",
            "type": "text",
            "onkeyup": "$('#characterCount').text('" + Lang.AccountPayment.CharactersLeft + " ' + (40 - $('#voucherText').val().length));"
        });
        $voucherText.Position = createPositionElement("337.5px", "315", "10");
        dialogContentElem.Add($voucherText);
        var $characterCount = createLabel(Lang.AccountPayment.CharactersLeft + " 40", undefined, "characterCount");
        $characterCount.Position = createPositionElement("90%", "440", "10");
        dialogContentElem.Add($characterCount);
    }
    function checkDropDownField(fieldId, requiredId) {
        var selectedId = $("#" + fieldId).children(":selected").attr("id");
        if (selectedId == undefined) {
            $("#" + requiredId).text("* " + Lang.AccountPayment.Required);
            return false;
        }
        else {
            $("#" + requiredId).text("*");
            return true;
        }
    }
    function isToPayInvalid() {
        return $("#toPayInput").val().trim() == "" ||
            isNaN($("#toPayInput").val().replace(/,/g, ".").trim()) ||
            Number($("#toPayInput").val().replace(/,/g, ".").trim()) <= 0;
    }
    function isToPayValid() {
        if (isToPayInvalid()) {
            $("#toPayValidate").text("* " + Lang.AccountPayment.Invalid);
            $('#toPayInput').on('keyup', function () {
                if (isToPayInvalid()) {
                    $("#toPayValidate").text("* " + Lang.AccountPayment.Invalid);
                }
                else {
                    $("#toPayValidate").text("*");
                }
            });
            return false;
        }
        else {
            $("#toPayValidate").text("*");
            return true;
        }
    }
    function isVoucherTextFilled() {
        if ($("#voucherText").val().trim() == "") {
            $("#voucherTextRequired").text("* " + Lang.AccountPayment.Required);
            $('#voucherText').on('keyup', function () {
                $('#characterCount').text(Lang.AccountPayment.CharactersLeft + ' ' + (40 - $('#voucherText').val().length));
                if ($("#voucherText").val().trim() == "") {
                    $("#voucherTextRequired").text("* " + Lang.AccountPayment.Required);
                }
                else {
                    $("#voucherTextRequired").text("*");
                }
            });
            return false;
        }
        else {
            $("#voucherTextRequired").text("*");
            return true;
        }
    }
    function areAccountPaymentFieldsValid() {
        var cashDeskFilled, paymentMethodFilled, toPayValid, voucherFilled;
        cashDeskFilled = checkDropDownField("cashDeskDropDown", "cashDeskRequired");
        paymentMethodFilled = checkDropDownField("paymentMethodDropDown", "paymentMethodRequired");
        toPayValid = isToPayValid();
        voucherFilled = isVoucherTextFilled();
        return cashDeskFilled && paymentMethodFilled && toPayValid && voucherFilled;
    }
    function getAccountPaymentButtons(event) {
        var buttons = [
            {
                text: Lang.AccountPayment.Cancel,
                click: function (params) {
                    H5ControlUtil.H5Dialog.DestroyDialog($(params.target).closest('.inforDialog').find('.inforMessageDialog'));
                }
            },
            {
                text: Lang.AccountPayment.Submit,
                click: function (params) {
                    if (areAccountPaymentFieldsValid()) {
                        prepareDataCRS315E(event);
                    }
                },
                isDefault: true
            }
        ];
        return buttons;
    }
    function openAccountPaymentDialog(cashDesksDropDownEntries, event) {
        var accountPaymentDialog, dialogId, settings, o, _this = this;
        accountPaymentDialog = $("<div>", {
            "id": "content",
            "class": "inforMessageDialog accountPaymentDialog",
            "tabindex": 0
        });
        var width = 350;
        var height = 500;
        settings = {
            title: Lang.AccountPayment.AccountPayment,
            dialogType: "General",
            closeOnEscape: false,
            beforeClose: function (e, ui) {
                H5ControlUtil.H5Dialog.DestroyDialog($(e.target));
                $(".accountPaymentDialog").remove();
            },
            open: function (event, ui) {
                var dialogContentElem = new ContentElement($(event.target).closest('.inforDialog'), event.target);
                createCashDeskElements(dialogContentElem, cashDesksDropDownEntries);
                createPaymentMethodElements(dialogContentElem);
                createToPayElements(dialogContentElem);
                createVoucherTextElements(dialogContentElem);
                var selectedCashDeskId = $('#cashDeskDropDown').children(":selected").attr("id");
                if (!selectedCashDeskId) {
                    clearPaymentMethod();
                }
                $('#cashDeskDropDownContainer .inforTextbox').focus();
            },
            buttons: getAccountPaymentButtons(event),
            autoFocus: true,
            width: width,
            height: height,
            withCancelButton: true
        };
        o = $.extend({}, settings, Option);
        accountPaymentDialog.inforMessageDialog(o);
        return accountPaymentDialog;
    }
    function prepareAccountPaymentData(event) {
        var cashDesksDropDownEntries;
        getCashDesk().then(function (cashDeskResponse) {
            cashDesksDropDownEntries = cashDeskResponse.MIRecord.map(function (miRecord) {
                return {
                    id: getValueFromMiRecord(miRecord, "CSHD"),
                    label: getValueFromMiRecord(miRecord, "CDNM"),
                    value: getValueFromMiRecord(miRecord, "CDNM")
                };
            });
            openAccountPaymentDialog(cashDesksDropDownEntries, event);
        }).fail(function () {
            if (window.console) {
                console.error("Failed to get cash desk for CRS315");
                return;
            }
        });
    }
    function clearPaymentMethod() {
        $('#paymentMethodDropDown').setValue("");
        $('#paymentMethodDropDown').empty();
        $('#paymentMethodDropDownContainer').addClass('disabled');
        $('#paymentMethodDropDownContainer').find('.inforDropDownList').attr('disabled', 'true');
    }
    function fillPaymentMethod(cashDesk, dialogContentElem) {
        clearPaymentMethod();
        getPaymentMethod(cashDesk).then(function (paymentMethodResponse) {
            var paymentMethodDropDownEntries = paymentMethodResponse.MIRecord.filter(function (miRecord) {
                var pycl = getValueFromMiRecord(miRecord, "PYCL");
                return (pycl == 0 || pycl == 3);
            }).map(function (filteredRecord) {
                var pycd = getValueFromMiRecord(filteredRecord, "PYCD");
                var pycl = getValueFromMiRecord(filteredRecord, "PYCL");
                return { id: pycd, label: pycd, value: pycl };
            });
            if (paymentMethodDropDownEntries.length == 0) {
                clearPaymentMethod();
            }
            else {
                $('#paymentMethodDropDownContainer').removeClass('disabled');
                $('#paymentMethodDropDownContainer').find('.inforDropDownList').removeAttr('disabled');
                if (paymentMethodDropDownEntries.length > 1) {
                    var $entry = $("<option>");
                    $('#paymentMethodDropDown').append($entry);
                }
                for (var _i = 0, paymentMethodDropDownEntries_1 = paymentMethodDropDownEntries; _i < paymentMethodDropDownEntries_1.length; _i++) {
                    var paymentMethodEntry = paymentMethodDropDownEntries_1[_i];
                    var $entry = $("<option>", {
                        "id": paymentMethodEntry["id"],
                        "text": paymentMethodEntry["label"],
                        "value": paymentMethodEntry["value"],
                    });
                    $('#paymentMethodDropDown').append($entry);
                }
            }
            $('#paymentMethodDropDown').inforDropDownList();
        }).fail(function () {
            if (window.console) {
                console.error("Failed to get payment methods for cash desk " + cashDesk);
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
        var cenPos = {};
        var panelCalled = false;
        var inFieldsToken = {};
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
            if (inFields.typeOfTransaction !== 'Credit') {
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
        if ((panelHeader == 'CRS435/E' || panelHeader == 'CRS610/J' || panelHeader == 'CRS315/E') && inFieldsCRS435) {
            panelCalled = true;
            cenPos.type = inFieldsCRS435.type;
            cenPos.currencyCode = inFieldsCRS435.currencyCode;
            if (panelHeader != 'CRS610/J') {
                cenPos.amount = inFieldsCRS435.amount;
            }
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
            if (inFieldsCRS435.email !== "") {
                cenPos.email = inFieldsCRS435.email;
            }
        }
        if (!panelCalled) {
            throw Error("Did not find a suitable statement for panel header " + panelHeader);
        }
        // cenPos.urlresponse = window.btoa(returnUrl);
        cenPos.responseType = "message";
        cenPos.RedirectType = "true";
        var queryData = encodeQueryData(cenPos);
        if (window.console) {
            debug("QueryData: ", paramReplace("password", decodeURIComponent(queryData), "************"));
        }
        inFieldsToken.password = cenPos.password;
        inFieldsToken.userId = cenPos.userid;
        inFieldsToken.merchantId = cenPos.merchantid;
        inFieldsToken.customerCode = cenPos.customercode;
        inFieldsToken.transactionType = cenPos.type;
        callCenPos(cenPos, inFields, preDataResponse, controller, panelHeader, inFieldsCRS435, inFieldsToken);
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
            if (typeOfTransaction !== 'Credit' && hasDataFromM3(data) || typeOfTransaction === 'Credit') {
                if (window.console) {
                    debug('Received credit card lines data:', data);
                }
                deffered.resolve(data);
            }
            else {
                console.error("Failed to get any response: /m3api-rest/execute/OIS215MI/LstLineCrCrd ? PMNB = " + pmnb + " & RCVA=" + rcva, data);
                deffered.reject();
            }
        });
        retrieve.fail(function (err) {
            console.error("Failed to get any response: /m3api-rest/execute/OIS215MI/LstLineCrCrd ? PMNB = " + pmnb + " & RCVA=" + rcva, err);
            deffered.reject();
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
                deffered.reject();
            }
        });
        retrieve.fail(function (err) {
            console.error("Failed to get any response: /m3api-rest/execute/CRS610MI/GetBasicData?CUNO=" + pyno, err);
            deffered.reject();
        });
        return deffered.promise();
    }
    function getPayerEmail(cuno) {
        var deffered = $.Deferred();
        if (window.console) {
            debug('getPayerEmail(): Getting payer email...');
        }
        // EMTP=01 means Email key is a customer number (CUNO)
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/CRS111MI/Get?EMKY=", cuno, "&EMTP=", "01"].join(''),
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (hasDataFromM3(data)) {
                if (window.console) {
                    debug('Received payer data:', data);
                }
                deffered.resolve(getValue(data, "EMAL"));
            }
            else {
                debug("No email for customer " + cuno + " from CRS111.", data);
                deffered.resolve("");
            }
        });
        retrieve.fail(function (err) {
            console.error(["Failed to get any response: /m3api-rest/execute/CRS111MI/Get?EMKY=", cuno, "&EMTP=", "01"].join(''), err);
            deffered.reject();
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
                deffered.reject();
            }
        });
        retrieve.fail(function () {
            console.error("Failed to get any response: /m3api-rest/execute/CRS434MI/Get3rdPartyId2?TRDI=" + trdi);
            deffered.reject();
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
                deffered.reject();
            }
        });
        retrieve.fail(function (err) {
            console.error(["Failed to get any response: /m3api-rest/execute/OIS215MI/GetHeadValues?PMNB=", pmnb, "&CSHD=", cshd].join(''), err);
            deffered.reject();
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
                deffered.reject();
            }
        });
        retrieve.fail(function (err) {
            console.error(["Failed to get any response: /m3api-rest/execute/OIS215MI/GetDetails?PMNB=", pmnb, "&PLNB=", plnb].join(''), err);
            deffered.reject();
        });
        return deffered.promise();
    }
    function addPayment(inFields, preData, cenPosResponse) {
        if (window.console) {
            debug('CenPos response: ' + JSON.stringify(cenPosResponse));
            debug('addPayment(): Add payment...');
            debug('PMNB: ' + inFields.PMNB);
            debug('PYCD: ' + inFields.PYCD);
        }
        var pydt;
        if (preData) {
            pydt = getValue(preData.headerData, "PYDT");
        }
        else {
            pydt = inFields.PYDT;
        }
        var pmam = cenPosResponse ? cenPosResponse.amount : inFields.RCVA_Orig;
        if (inFields.typeOfTransaction.toLowerCase() === 'credit'.toLowerCase()) {
            pmam = ["-", pmam].join('');
        }
        var trty = (inFields.typeOfTransaction.toLowerCase() === 'sale'.toLowerCase()) ? 'S' : 'C';
        var url;
        if (cenPosResponse) {
            var irno = cenPosResponse.referencenumber;
            var ctpy = cenPosResponse.cardtype;
            var canu = cenPosResponse.cardnumber;
            var noca = cenPosResponse.nameoncard;
            url = ["/m3api-rest/execute/OIS215MI/AddPayment?PMNB=", inFields.PMNB, "&CSHD=", inFields.CSHD, "&PYNO=", inFields.PYNO, "&PYCD=", inFields.PYCD, "&PYDT=", pydt, "&CUCD=", inFields.CUCD, "&PMAM=", pmam, "&IRNO=", irno,
                "&3RDI=", inFields.TRDI, "&3RDP=", inFields.TRDP, "&TRTY=", trty, "&CTPY=", ctpy, "&CANU=", canu, "&NOCA=", noca].join('');
        }
        else {
            url = ["/m3api-rest/execute/OIS215MI/AddPayment?PMNB=", inFields.PMNB, "&CSHD=", inFields.CSHD, "&PYNO=", inFields.PYNO, "&PYCD=", inFields.PYCD, "&PYDT=", pydt, "&CUCD=", inFields.CUCD, "&PMAM=", pmam].join('');
        }
        if (window.console) {
            debug("TRTY: " + trty);
            debug("CTPY: " + ctpy);
            debug("CANU: " + canu);
            debug("NOCA: " + noca);
        }
        var promise = $.ajax({
            url: url,
            dataType: 'json',
            success: function (data) {
                if (window.console) {
                    debug('Received add payment data:', data);
                }
                return data;
            },
            error: function (err) {
                if (window.console) {
                    console.error("Failed to upload data: " + url);
                }
                return;
            }
        });
        return promise;
    }
    function addPaymentNo(cashDeskHead) {
        var deferred = $.Deferred();
        if (window.console) {
            debug('addPaymentNo(): Add payment no...');
        }
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/OIS215MI/AddPaymentNo?CSHD=", cashDeskHead].join(""),
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (hasDataFromM3(data)) {
                if (window.console) {
                    debug('Received payer data:', data);
                }
                deferred.resolve(data);
            }
            else {
                console.error(["Failed to get any response: /m3api-rest/execute/OIS215MI/AddPaymentNo?CSHD=", cashDeskHead].join(""), data);
                showConfirmDialog("Error", "AddPaymentNo", data["Message"] ? data["Message"] : "Error in AddPaymentNo");
                deferred.reject();
            }
        });
        retrieve.fail(function (err) {
            console.error(["Failed to get any response: /m3api-rest/execute/OIS215MI/AddPaymentNo?CSHD=", cashDeskHead].join(""), err);
            deferred.fail();
        });
        return deferred.promise();
    }
    function addOnAccount(inFields) {
        var paymentNumber = inFields.PMNB;
        var cashDeskHead = inFields.CSHD;
        var currency = inFields.CUCD;
        var payer = inFields.PYNO;
        var paymentDate = inFields.PYDT;
        var year = inFields.YEA4;
        var paymentAmount = inFields.RCVA_Orig;
        var voucherText = inFields.VTXT;
        var deferred = $.Deferred();
        if (window.console) {
            debug('addOnAccount(): Add payment no...');
        }
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/OIS215MI/AddOnAccount?PMNB=", paymentNumber, "&CSHD=", cashDeskHead, "&CUCD=", currency,
                "&PYNO=", payer, "&PYDT=", paymentDate, "&YEA4=", year, "&PMAM=", paymentAmount, "&VTXT=", voucherText].join(""),
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (hasDataFromM3(data)) {
                if (window.console) {
                    debug('Received payer data:', data);
                }
                deferred.resolve(data);
            }
            else {
                console.error(["/m3api-rest/execute/OIS215MI/AddOnAccount?PMNB=", paymentNumber, "&CSHD=", cashDeskHead, "&CUCD=", currency,
                    "&PYNO=", payer, "&PYDT=", paymentDate, "&YEA4=", year, "&PMAM=", paymentAmount, "&VTXT=", voucherText].join(""), data);
                $('.inforMessageDialog').remove();
                showConfirmDialog("Error", "AddOnAccount", data["Message"] ? data["Message"] : "Error in AddOnAccount");
                deferred.reject();
            }
        });
        retrieve.fail(function (err) {
            console.error(["/m3api-rest/execute/OIS215MI/AddOnAccount?PMNB=", paymentNumber, "&CSHD=", cashDeskHead, "&CUCD=", currency,
                "&PYNO=", payer, "&PYDT=", paymentDate, "&YEA4=", year, "&PMAM=", paymentAmount, "&VTXT=", voucherText].join(""), err);
            deferred.fail();
        });
        return deferred.promise();
    }
    function validate(inFields) {
        var paymentNumber = inFields.PMNB;
        var cashDeskHead = inFields.CSHD;
        var payer = inFields.PYNO;
        var paymentDate = inFields.PYDT;
        var currency = inFields.CUCD;
        var deferred = $.Deferred();
        if (window.console) {
            debug('Validate(): Validating...');
        }
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/OIS215MI/Validate?PMNB=", paymentNumber, "&CSHD=", cashDeskHead, "&CUCD=", currency,
                "&PYNO=", payer, "&PYDT=", paymentDate].join(""),
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (hasDataFromM3(data)) {
                if (window.console) {
                    debug('Received payer data:', data);
                }
                deferred.resolve(data);
            }
            else {
                console.error(["/m3api-rest/execute/OIS215MI/Validate?PMNB=", paymentNumber, "&CSHD=", cashDeskHead, "&CUCD=", currency,
                    "&PYNO=", payer, "&PYDT=", paymentDate].join(""), data);
                $('.inforMessageDialog').remove();
                showConfirmDialog("Error", "Validate", data["Message"] ? data["Message"] : "Error in Validate");
                deferred.reject();
            }
        });
        retrieve.fail(function (err) {
            console.error(["/m3api-rest/execute/OIS215MI/Validate?PMNB=", paymentNumber, "&CSHD=", cashDeskHead, "&CUCD=", currency,
                "&PYNO=", payer, "&PYDT=", paymentDate].join(""), err);
            deferred.fail();
        });
        return deferred.promise();
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
            var refNo = cenPosResponse.referencenumber;
            if (refNo == null) {
                refNo = "";
            }
            var ccec = cenPosResponse.result;
            if (ccec === "undefined" || ccec === "null") {
                ccec = "-1";
            }
            url = ["/m3api-rest/execute/OIS215MI/Add3rdpResult?PMNB=", inFields.PMNB, "&CCEC=", ccec, "&MSGE=", cenPosResponse.message, "&IRNO=", refNo].join('');
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
                    deffered.reject();
                }
                else {
                    deffered.resolve();
                }
            }
        });
        retrieve.fail(function (err) {
            console.error(["/m3api-rest/execute/OIS215MI/ValidateCCData?PMNB=", inFields.PMNB, "&CSHD=", inFields.CSHD, "&PYNO=", inFields.PYNO, "&PYDT=", inFields.PYDT, "&CUCD=", inFields.CUCD, "&PYCD=", inFields.PYCD, "&PMAM=", inFields.RCVA_Orig].join(''), err);
            deffered.reject();
        });
        return deffered.promise();
    }
    function addCCRefNo(inFieldsCRS435, cenPosResponse, panelHeader) {
        var deffered = $.Deferred();
        var userDIVI = ScriptUtil.GetUserContext().CurrentDivision;
        var stat = cenPosResponse.result;
        var result = parseInt(stat);
        if (!isNaN(result)) {
            if (result === 0) {
                if (inFieldsCRS435.type === "Credit") {
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
        var trdp, trdi, orno;
        if (panelHeader == 'CRS610/J') {
            trdp = "CenPos";
            trdi = "CenPOS";
            orno = inFieldsCRS435.customercode;
        }
        else {
            trdp = ScriptUtil.GetFieldValue("WW3RDP");
            trdi = ScriptUtil.GetFieldValue("WE3RDI");
            orno = ScriptUtil.GetFieldValue("WWORNO");
        }
        if (window.console) {
            debug('addCCRefNo(): Add AddCCRefNo values...');
            debug(["/m3api-rest/execute/CRCCINMI/AddCCRefNo?DIVI=", userDIVI, "&3RDP=", trdp, "&RORC=", "3", "&CCEC=", cenPosResponse.result, "&MSG1=", cenPosResponse.message, "&CCAA=", cenPosResponse.amount,
                "&CANU=", cenPosResponse.cardnumber, "&CTPY=", cenPosResponse.cardtype, "&STAT=", stat, "&REFE=", cenPosResponse.referencenumber, "&TRTY=", trty, "&CUCD=", inFieldsCRS435.currencyCode, "&3RDI=", trdi,
                "&NOCA=", cenPosResponse.nameoncard, "&ORNO=", orno].join(''));
            //            debug('PLNB: ' + plnb);
        }
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/CRCCINMI/AddCCRefNo?DIVI=", userDIVI, "&3RDP=", trdp, "&RORC=", "3", "&CCEC=", cenPosResponse.result, "&MSG1=", cenPosResponse.message, "&CCAA=", cenPosResponse.amount,
                "&CANU=", cenPosResponse.cardnumber, "&CTPY=", cenPosResponse.cardtype, "&STAT=", stat, "&REFE=", cenPosResponse.referencenumber, "&TRTY=", trty, "&CUCD=", inFieldsCRS435.currencyCode, "&3RDI=", trdi,
                "&NOCA=", cenPosResponse.nameoncard, "&ORNO=", orno].join(''),
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
                console.error(["Failed to get any response: /m3api-rest/execute/CRCCINMI/AddCCRefNo?DIVI=", userDIVI, "&3RDP=", trdp, "&RORC=", "3", "&CCEC=", cenPosResponse.result, "&MSG1=", cenPosResponse.message, "&CCAA=", cenPosResponse.amount,
                    "&CANU=", cenPosResponse.cardnumber, "&CTPY=", cenPosResponse.cardtype, "&STAT=", stat, "&REFE=", cenPosResponse.referencenumber, "&TRTY=", trty, "&CUCD=", inFieldsCRS435.currencyCode, "&TRDI=", trdi,
                    "&NOCA=", cenPosResponse.nameoncard, "&ORNO=", orno].join('')), data;
                deffered.fail();
            }
        });
        retrieve.fail(function (err) {
            console.error(["Failed to get any response: /m3api-rest/execute/CRCCINMI/AddCCRefNo?DIVI=", userDIVI, "&3RDP=", trdp, "&RORC=", "3", "&CCEC=", cenPosResponse.result, "&MSG1=", cenPosResponse.message, "&CCAA=", cenPosResponse.amount,
                "&CANU=", cenPosResponse.cardnumber, "&CTPY=", cenPosResponse.cardtype, "&STAT=", stat, "&REFE=", cenPosResponse.referencenumber, "&TRTY=", trty, "&CUCD=", inFieldsCRS435.currencyCode, "&TRDI=", trdi,
                "&NOCA=", cenPosResponse.nameoncard, "&ORNO=", orno].join('')), err;
            deffered.fail();
        });
        return deffered.promise();
    }
    function getCashDesk() {
        var deffered = $.Deferred();
        var userID = ScriptUtil.GetUserContext().USID;
        var facility = ScriptUtil.GetUserContext().FACI;
        if (window.console) {
            debug('getCashHead(): Getting cash desk...');
        }
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/OIS210MI/LstAuthCashDesk?USID=", userID, "&FACI=", facility].join(""),
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (hasDataFromM3(data)) {
                if (window.console) {
                    debug('Received cash desk data:', data);
                }
                deffered.resolve(data);
            }
            else {
                console.error("Empty MI data for: /m3api-rest/execute/OIS210MI/LstAuthCashDesk", data);
                deffered.reject();
            }
        });
        retrieve.fail(function (err) {
            console.error("Failed to get any response: /m3api-rest/execute/OIS210MI/LstAuthCashDesk", err);
            deffered.fail();
        });
        return deffered.promise();
    }
    function getPaymentMethod(cshd) {
        var deffered = $.Deferred();
        if (window.console) {
            debug('getCashHead(): Getting payment method...');
        }
        var retrieve = $.ajax({
            url: ["/m3api-rest/execute/OIS210MI/LstPayMethods?CSHD=", cshd].join(""),
            dataType: 'json',
        });
        retrieve.done(function (data) {
            if (hasDataFromM3(data)) {
                if (window.console) {
                    debug('Received payment method data:', data);
                }
                deffered.resolve(data);
            }
            else {
                console.error("Empty MI data for: /m3api-rest/execute/OIS210MI/LstPayMethods", data);
                deffered.reject();
            }
        });
        retrieve.fail(function (err) {
            console.error("Failed to get any response: /m3api-rest/execute/OIS210MI/LstPayMethods", err);
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
        $("body").inforBusyIndicator({ delay: 100, modal: true });
    }
    function enableH5Client() {
        $("body").inforBusyIndicator("close");
    }
    function counter(args) {
        var controller = args[0];
        var inFields = args[1];
        var preData = args[2];
        var panelHeader = args[3];
        var inFieldsCRS435 = args[4];
        var cenposIframe = args[5];
        var cenposDialog = args[6];
        var inFieldsToken = args[7];
        var response = args[8];
        H5ControlUtil.H5Dialog.DestroyDialog($('.cenposDialog'));
        window.removeEventListener('message', fnBind, false);
        if (panelHeader == 'OIS215/B' || panelHeader == 'OIS215/D') {
            addCenPosResult(inFields, response).then(function () {
                if (panelHeader == 'OIS215/B') {
                    if (response.result === "0") {
                        addPayment(inFields, preData, response).then(function (resp) {
                            setTimeout(function () {
                                controller.PressKey("F5");
                            }, 100);
                            ScriptUtil.SetFieldValue("WSRCVA", "");
                            if (tokensEnabled) {
                                var onClosedOk = function () {
                                    addCardToken(inFieldsToken, response.referencenumber);
                                };
                                showConfirmDialog("Question", Lang.Token.SaveToken, Lang.Token.SaveCCInfo, onClosedOk);
                            }
                        });
                    }
                    ;
                }
                if (panelHeader == 'OIS215/D') {
                    if (response.result === "0") {
                        delLine(inFields).then(function (resp) {
                            setTimeout(function () {
                                controller.PressKey("F5");
                            }, 100);
                        });
                    }
                    ;
                }
            }).always(function () {
                setTimeout(function () {
                    controller.PressKey("F5");
                }, 100);
            });
        }
        else if (panelHeader == 'CRS435/E') {
            addCCRefNo(inFieldsCRS435, response, panelHeader).then(function (resp) {
                controller.PressKey("F5");
                if (tokensEnabled) {
                    var onClosedOk = function () {
                        addCardToken(inFieldsToken, response.referencenumber);
                    };
                    showConfirmDialog("Question", Lang.Token.SaveToken, Lang.Token.SaveCCInfo, onClosedOk);
                }
            });
        }
        else if (panelHeader == 'CRS610/J') {
            if (response.result !== "-1") {
                var feedback;
                if (response.result === "0") {
                    feedback = Lang.Token.CreditCardSaved.replace("{0}", cleanupInputValue(response.cardnumber.replace(/\*/g, '')));
                }
                else {
                    feedback = "Lang.Token.Status " + response.message;
                }
                showConfirmDialog("Information", Lang.Token.AddingToken, feedback);
            }
        }
        else if (panelHeader == 'CRS315/E') {
            if (response.result === "0") {
                disableH5Client();
                callAccountPaymentSubmitActions(PaymentType.Card, controller, inFields, preData, response, inFieldsToken).always(function () {
                    enableH5Client();
                });
            }
            else {
                H5ControlUtil.H5Dialog.DestroyDialog($('.accountPaymentDialog'));
                showConfirmDialog("Error", Lang.AccountPayment.AccountPayment, Lang.Token.Status + " " + response.message);
            }
        }
        if (window.console) {
            debug("CenPos result code: " + response.result);
            debug("CenPos result message: " + response.message);
        }
    }
    function getParameterByName(locationSearch, name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp(name + "=([^&#]*)");
        var results = regex.exec(locationSearch);
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
    var receiveMessage = function (response, params) {
        var controller = params.controller, inFields = params.inFields, preData = params.preData, panelHeader = params.panelHeader, inFieldsCRS435 = params.inFieldsCRS435, cenposIframe = params.cenposIframe, cenposDialog = params.cenposDialog, inFieldsToken = params.inFieldsToken;
        counter([controller, inFields, preData, panelHeader, inFieldsCRS435, cenposIframe, cenposDialog, inFieldsToken, response]);
    };
    var registerMessage = function (controller, inFields, preData, panelHeader, inFieldsCRS435, cenposIframe, cenposDialog, inFieldsToken) {
        var messageParams = {
            controller: controller,
            inFields: inFields,
            preData: preData,
            panelHeader: panelHeader,
            inFieldsCRS435: inFieldsCRS435,
            cenposIframe: cenposIframe,
            cenposDialog: cenposDialog,
            inFieldsToken: inFieldsToken
        };
        fnBind = fn.bind(messageParams);
        window.addEventListener('message', fnBind, false);
    };
    var fn = function (event) {
        if (event.origin !== 'https://www4.cenpos.net') {
            return;
        }
        if (!event.data || !event.data.type || event.data.type !== 'CenPOSResponse') {
            return;
        }
        var response = event.data.data;
        var messageParams = this;
        receiveMessage(response, messageParams);
    };
    function deleteToken(row, inFieldsToken, controller, panelHeader) {
        var _this = this;
        $('body').inforMessageDialog({
            title: Lang.Token.DeleteToken,
            shortMessage: Lang.Token.DeleteTokenConfirm,
            detailedMessage: "",
            dialogType: "Confirmation",
            showTitleClose: false,
            buttons: [{
                    text: "Yes",
                    click: function () {
                        deleteCardToken(inFieldsToken, row.id).then(function (deleteCardTokenResult) {
                            var todeletetokenIndex = _this.grid.getData().getItems().indexOf(row);
                            _this.grid.setSelectedRows([todeletetokenIndex], false);
                            _this.grid.removeSelectedRows();
                        });
                        $(this).inforDialog("close");
                    },
                    isDefault: true
                }, {
                    text: "No",
                    click: function () { $(this).inforDialog("close"); }
                }]
        });
        setTimeout(function () { _this.grid.setSelectedRows([], false); }, 0);
    }
    function getUseCardTokenDialogButtons(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken) {
        var _this_1 = this;
        var buttons = [];
        if (isPaymentPanel(panelHeader)) {
            var amount = getParameterByName(params, "amount");
            var invoice = getParameterByName(params, "invoice");
            var useTokenButton = {
                text: Lang.Token.UseToken,
                click: function (params) {
                    if (_this_1.grid.getSelectedRows().length > 0) {
                        var selectedItemIndex = _this_1.grid.getSelectedRows()[0];
                        var selectedItem = _this_1.grid.getData().getItem(selectedItemIndex);
                        useCardToken(selectedItem, amount, invoice, inFieldsToken).then(function (useCardTokenResult) {
                            H5ControlUtil.H5Dialog.DestroyDialog($(params.target).closest('.inforDialog').find('.inforMessageDialog'));
                            var response = {
                                result: useCardTokenResult.tokenResult.result,
                                message: useCardTokenResult.tokenResult.message,
                                amount: useCardTokenResult.tokenResult.amount,
                                cardnumber: selectedItem.CardNumber,
                                cardtype: useCardTokenResult.tokenResult.cardType,
                                referencenumber: useCardTokenResult.tokenResult.referenceNumber,
                                nameoncard: selectedItem.Name
                            };
                            if (panelHeader == 'CRS435/E') {
                                addCCRefNo(inFieldsCRS435, response, panelHeader).then(function (resp) {
                                    controller.PressKey("F5");
                                });
                            }
                            else if (panelHeader == 'CRS315/E') {
                                H5ControlUtil.H5Dialog.DestroyDialog($('.accountPaymentDialog'));
                                if (Number(response.result) == 0) {
                                    disableH5Client();
                                    callAccountPaymentSubmitActions(PaymentType.Token, controller, inFields, preData, response, inFieldsToken).always(function () {
                                        enableH5Client();
                                    });
                                }
                                else {
                                    showConfirmDialog("Information", Lang.Token.UseToken, response.message);
                                }
                            }
                            else {
                                addCenPosResult(inFields, response).then(function () {
                                    if (panelHeader == 'OIS215/B') {
                                        if (response.result === "0") {
                                            addPayment(inFields, preData, response).then(function (resp) {
                                                setTimeout(function () {
                                                    controller.PressKey("F5");
                                                }, 100);
                                                ScriptUtil.SetFieldValue("WSRCVA", "");
                                            });
                                        }
                                        ;
                                    }
                                }).always(function () {
                                    setTimeout(function () {
                                        controller.PressKey("F5");
                                    }, 100);
                                });
                            }
                        });
                    }
                    else {
                        showMessageDialog("Error", Lang.Token.UseToken, Lang.Token.SelectToken);
                    }
                },
                isDefault: true
            };
            buttons.push(useTokenButton);
        }
        var useOtherCard = {
            text: ((panelHeader == 'CRS610/J') ? Lang.Token.AddNewCreditCard : Lang.Token.UseOtherCard),
            click: function () {
                H5ControlUtil.H5Dialog.DestroyDialog($('.tokensDialog'));
                if (panelHeader == 'CRS315/E') {
                    H5ControlUtil.H5Dialog.DestroyDialog($('.accountPaymentDialog'));
                }
                getCenposAuthDialog(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken);
            },
            isDefault: (panelHeader == 'CRS610/J') ? true : false
        };
        buttons.push(useOtherCard);
        return buttons;
    }
    function getTokenColumns(inFieldsToken, controller, panelHeader) {
        var columns = [
            { id: "cardType", name: "Card Type", field: "CardType" },
            { id: "cardNumber", name: "Card Number", field: "CardNumber" },
            { id: "nameOnCard", name: "Name", field: "Name" },
            { id: "customerEmailAddress", name: "Email Address", field: "EmailAddress" },
            { id: "deleteTokenBtn", name: "Action", formatter: ButtonCellFormatter, buttonCssClass: "inforIconButton gridIcon delete", buttonClick: function (row) { deleteToken(row, inFieldsToken, controller, panelHeader); }, cssClass: "non-data-cell alignCenter", headerCssClass: "alignHeaderCenter" }
        ];
        return columns;
    }
    function getTokenRows(tokens) {
        var rows = [];
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            var row = {
                id: token["TokenId"],
                CardType: token["CardType"],
                CardNumber: "**** **** **** " + token["CardNumber"],
                Name: token["NameOnCard"],
                EmailAddress: token["CustomerEmailAddress"]
            };
            rows.push(row);
        }
        return rows;
    }
    function getUseCardTokenDialog(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, tokens, inFieldsToken) {
        var tokensDialog, dialogId, settings, o, _this = this;
        ;
        tokensDialog = $("<div>", {
            "id": "content",
            "class": "inforMessageDialog tokensDialog",
            "tabindex": 0
        });
        var width = 650;
        var height = 500;
        var options = Configuration.Current.ListConfig("id", getTokenColumns(inFieldsToken, controller, panelHeader), getTokenRows(tokens));
        options["forceFitColumns"] = true;
        options["multiSelect"] = false;
        options["showFilter"] = false;
        options["showCheckboxes"] = isPaymentPanel(panelHeader);
        settings = {
            title: Lang.Token.Tokens,
            dialogType: "General",
            closeOnEscape: false,
            beforeClose: function (e, ui) {
                H5ControlUtil.H5Dialog.DestroyDialog($(e.target));
            },
            open: function (event, ui) {
                var $list = $("<div>", {
                    "class": "inforDataGrid",
                    "id": "tokensTable",
                    "height": "375px",
                    "overflow": "hidden"
                });
                $list.Position = new PositionElement();
                $list.Position.Width = "90%";
                $list.Position.Top = "60";
                $list.Position.Left = "32.5";
                var dialogContentElem = new ContentElement($(event.target).closest('.inforDialog'), event.target);
                dialogContentElem.Add($list);
                _this.grid = $list.inforDataGrid(options);
                if (isPaymentPanel(panelHeader)) {
                    _this.grid.onSelectedRowsChanged.subscribe(function (e, args) {
                        var rows = _this.grid.getSelectedRows();
                        var isdisable = (rows.length == 0);
                        var dialog = $("div#content.inforMessageDialog.tokensDialog.inforDialogContent");
                        var dialogButtonBar = $(dialog.siblings("div.dialogButtonBar:eq(0)"));
                        var usetokenbtn = dialogButtonBar.find("button.default:eq(0)");
                        usetokenbtn.prop("disabled", isdisable);
                    });
                }
                _this.grid.trigger(_this.grid.onSelectedRowsChanged);
            },
            buttons: getUseCardTokenDialogButtons(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken),
            autoFocus: true,
            width: width,
            height: height,
            withCancelButton: true
        };
        o = $.extend({}, settings, Option);
        tokensDialog.inforMessageDialog(o);
        return tokensDialog;
    }
    function getCenposAuthDialog(params, url, controller, inFields, preData, panelHeader, inFieldsCRS435, inFieldsToken) {
        var cenposDialog, dialogId, settings, o;
        cenposDialog = $("<div>", {
            "id": "cenposDialog",
            "class": "inforMessageDialog cenposDialog",
            "tabindex": 0
        });
        var width = 540;
        var height = 670;
        var cenPosWidth = 540;
        var cenPosHeight = 640;
        dialogId = cenposDialog.attr("id");
        if (!H5ControlUtil.H5Dialog.AddDialogInstance(dialogId)) {
            cenposDialog.remove();
            return;
        }
        settings = {
            title: Lang.Token.CenposForm,
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
                    width: cenPosWidth,
                    height: cenPosHeight,
                    url: url,
                    params: params
                });
                var cenposIframe = $("#cenposPayIFrameId");
                registerMessage(controller, inFields, preData, panelHeader, inFieldsCRS435, cenposIframe, cenposDialog, inFieldsToken);
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
    function createSOAPParams(inFieldsToken, additionalParams) {
        var password = window.atob(inFieldsToken.password);
        var userId = encodeURIComponent(inFieldsToken.userId);
        var merchantId = encodeURIComponent(inFieldsToken.merchantId);
        var params = "<acr:MerchantId>" + merchantId + "</acr:MerchantId>\n            <acr:Password>" + password + "</acr:Password>\n            <acr:UserId>" + userId + "</acr:UserId>";
        params += additionalParams;
        return params;
    }
    function createSOAPMessage(methodName, soapParams) {
        var message = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tem=\"http://tempuri.org/\"\n            xmlns:acr=\"http://schemas.datacontract.org/2004/07/Acriter.ABI.CenPOS.EPayment.VirtualTerminal.Common\"\n            xmlns:acr1=\"http://schemas.datacontract.org/2004/07/Acriter.ABI.CenPOS.Client.Tokens.v2.Common.Requests\">\n            <soapenv:Header/>\n                <soapenv:Body>\n                    <tem:" + methodName + ">\n                        <tem:request>" + soapParams + "</tem:request>\n                    </tem:" + methodName + ">\n                </soapenv:Body>\n            </soapenv:Envelope>";
        return message;
    }
    function getCardTokens(inFieldsToken) {
        disableH5Client();
        var customerCode = encodeURIComponent(inFieldsToken.customerCode);
        var getTokenParams = "<acr1:CustomerCode>" + customerCode + "</acr1:CustomerCode>\n            <acr1:IncludeMultipleMerchants>false</acr1:IncludeMultipleMerchants>";
        var params = createSOAPParams(inFieldsToken, getTokenParams);
        var message = createSOAPMessage("GetToken", params);
        return sendSOAPRequest("http://tempuri.org/Tokens/GetToken", message).then(function (data, status, req) {
            return parseTokenResponse("getCardToken", { response: req.responseText });
        }).always(function () {
            enableH5Client();
        });
    }
    ;
    function addCardToken(inFieldsToken, referenceNumber) {
        disableH5Client();
        var addCardTokenParams = "<acr1:ReferenceNumber>" + referenceNumber + "</acr1:ReferenceNumber>";
        var params = createSOAPParams(inFieldsToken, addCardTokenParams);
        var message = createSOAPMessage("AddCardToken", params);
        return sendSOAPRequest("http://tempuri.org/Tokens/AddCardToken", message).then(function (data, status, req) {
            var result = parseTokenResponse('addCardToken', { response: req.responseText });
            var feedback;
            if (result.transactionOK) {
                feedback = Lang.Token.CreditCardSaved.replace("{0}", cleanupInputValue(result.cardNumber));
            }
            else {
                feedback = Lang.Token.Status + " " + result.message;
            }
            showConfirmDialog("Information", Lang.Token.AddingToken, feedback);
        }).always(function () {
            enableH5Client();
        });
    }
    ;
    function useCardToken(token, amount, invoice, inFieldsToken) {
        disableH5Client();
        var transactionType = encodeURIComponent(inFieldsToken.transactionType);
        var useCardTokenParams = "<acr1:Amount>" + amount + "</acr1:Amount>\n            <acr1:InvoiceNumber>" + invoice + "</acr1:InvoiceNumber>\n            <acr1:TokenId>" + token.id + "</acr1:TokenId>\n            <acr1:TransactionType>" + transactionType + "</acr1:TransactionType>";
        var params = createSOAPParams(inFieldsToken, useCardTokenParams);
        var message = createSOAPMessage("UseToken", params);
        return sendSOAPRequest("http://tempuri.org/Tokens/UseToken", message).then(function (data, status, req) {
            return parseTokenResponse("useCardToken", { response: req.responseText, token: token });
        }).always(function () {
            enableH5Client();
        });
    }
    ;
    function deleteCardToken(inFieldsToken, tokenId) {
        disableH5Client();
        var deleteCardTokenParams = "<acr1:TokenId>" + tokenId + "</acr1:TokenId>";
        var params = createSOAPParams(inFieldsToken, deleteCardTokenParams);
        var message = createSOAPMessage("DeleteCardToken", params);
        return sendSOAPRequest("http://tempuri.org/Tokens/DeleteCardToken", message).then(function (data, status, req) {
            return parseTokenResponse("deleteCardToken", { response: req.responseText });
        }).always(function () {
            enableH5Client();
        });
    }
    ;
    function sendSOAPRequest(soapAction, message) {
        return $.ajax({
            url: tokensEndpoint,
            type: "POST",
            dataType: "xml",
            contentType: "text/xml; charset=\"utf-8\"",
            processData: false,
            headers: {
                "SOAPAction": soapAction,
                "Accept": "*/*",
                "Cache-Control": "no-cache",
                "Accept-Language": "en-US",
                "x-flash-version": "16,0,0,305"
            },
            data: message,
            success: function (data, status, req) {
                return { data: data, status: status, req: req };
            },
            error: function (data, status, req) {
                return { data: data, status: status, req: req };
            }
        });
    }
    ;
    function parseTokenResponse(operation, raw) {
        if (!raw || !operation) {
            return {
                message: Lang.Token.UnableToProcessResponse,
                messageId: '',
                referenceNumber: '',
                result: '-1',
                transactionOK: false,
            };
        }
        var result;
        var response = jQuery.parseXML(raw.response);
        result = response.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes;
        var data = {
            message: result[0].textContent,
            result: result[1].textContent
        };
        if (operation === 'addCardToken') {
            data.cardLastFourDigit = result[2].textContent;
            data.cardType = result[3].textContent;
            data.isCommercialCard = result[4].textContent;
            data.tokenId = result[5].textContent;
        }
        if (operation === 'getCardToken') {
            data.tokens = [];
            if (result[2].childNodes.length > 0) {
                for (var tokenIndex = 0; tokenIndex < result[2].childNodes.length; tokenIndex++) {
                    var token = [];
                    for (var fieldIndex = 0; fieldIndex < result[2].childNodes[tokenIndex].childNodes.length; fieldIndex++) {
                        var key = $(result[2].childNodes[tokenIndex].childNodes[fieldIndex]).prop("tagName").replace('b:', '');
                        var value = $(result[2].childNodes[tokenIndex].childNodes[fieldIndex]).text();
                        token[key] = value;
                    }
                    data.tokens.push(token);
                }
            }
        }
        if (operation === 'useCardToken') {
            data.accountBalanceAmount = result[2].textContent;
            data.amount = result[3].textContent;
            data.authorizationNumber = result[4].textContent;
            data.cardType = result[5].textContent;
            data.discount = result[6].textContent;
            data.discountAmount = result[7].textContent;
            data.originalAmount = result[8].textContent;
            if (result[9].childNodes.length > 0) {
                data.parameterValidationResultList = [];
                for (var i = 0; i < result[9].childNodes.length; i++) {
                    var validationResult = {
                        name: result[9].childNodes[i].childNodes[0].textContent,
                        result: result[9].childNodes[i].childNodes[1].textContent
                    };
                    data.parameterValidationResultList.push(validationResult);
                }
            }
            data.partiallyAuthorizedAmount = result[10].textContent;
            data.referenceNumber = result[11].textContent;
            data.surcharge = result[12].textContent;
            data.surchargeAmount = result[13].textContent;
            data.traceNumber = result[14].textContent;
            data.cardLastFourDigit = raw.token.CardNumber;
            data.nameOnCard = raw.token.Name;
        }
        var resOk = (data.result === '0');
        var formattedResponse = {
            applicationIdentifier: '',
            authorizationCode: '',
            cardNumber: data.cardLastFourDigit,
            cardType: data.cardType,
            creditCardPaymentMethod: '',
            creditCardTransactionTime: '',
            message: data.message,
            messageId: '',
            nameOnCard: data.nameOnCard,
            panSequenceNumber: '',
            referenceNumber: data.referenceNumber,
            result: data.result,
            terminalId: '',
            transactionOK: resOk,
            verificationMethod: '',
            tokenResult: data
        };
        return formattedResponse;
    }
    ;
    function addButton(name, value, position, controller) {
        var buttonElement = new ButtonElement();
        buttonElement.Name = name;
        buttonElement.Value = value;
        buttonElement.Position = position;
        var contentElement = controller.GetContentElement();
        var button = contentElement.AddElement(buttonElement);
    }
    function addMantainCardsButton(controller) {
        var position = createPositionElement("14.5", "5", "1", "1");
        addButton("maintainButton", Lang.Token.MaintainLodgedCards, position, controller);
    }
    function addAccountPaymentButton(controller) {
        var position = createPositionElement("12.5", "5", "10", "1");
        addButton("accountPaymentButton", Lang.AccountPayment.AccountPayment, position, controller);
    }
    function cleanupInputValue(inputValue) {
        inputValue = inputValue.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        return inputValue;
    }
};
//# sourceMappingURL=CenPosM3_v6.js.map