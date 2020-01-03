var Cpq_M3_v1 = new function () {
    var _$host;
    var Child;
    var Timer;
    var debug;
    var isDebug;
    this.Init = function (scriptArgs) {
        isDebug = false;
        if (isDebug) {
            debug = console.log.bind(window.console);
        }
        else {
            debug = function () { };
        }
        var _args = scriptArgs.args;
        var _debug = scriptArgs.debug;
        var _controller = scriptArgs.controller;
        var _renderEngine = _controller.RenderEngine;
        var _$content = _renderEngine.Content;
        var _userContext = undefined;
        _$host = _controller.ParentWindow;
        var panelHeader = _renderEngine.PanelHeader;
        if (panelHeader !== 'PDS650/E') {
            debug('Cpq_M3 script may only be used on PDS650/E panel');
            showMessageDialog("Error", "Invalid script", "Cpq_M3 script may only be used on PDS650/E panel");
        }
        addDialogWindow(_controller);
    };
    function getProgramDetails(_renderEngine) {
        var program = _renderEngine.ProgramName;
        var panelHeader = _renderEngine.PanelHeader;
        var panelLetter = panelHeader.substr(-1, 1);
        if (program) {
            return true;
        }
        else {
            return false;
        }
    }
    function createElement(elemType, title, id) {
        var $tempElem;
        if (elemType === 'button') {
            var btn_elem = new ButtonElement();
            btn_elem.Value = title;
            $tempElem = ControlFactory.CreateButton(btn_elem);
        }
        else if (elemType === 'textBox') {
        }
        return $tempElem;
    }
    function addElementToRowCol($host, $elem, row, col, width) {
        $elem.css({
            'position': 'absolute',
            'left': (parseInt(col) * 10) + 'px',
        });
        if (typeof width !== 'undefined') {
            $elem.css['width'] = width + 'px';
        }
        $host.find('#pRow' + row).append($elem);
    }
    function showMessageDialog(msgType, msgTitle, msg, shortMsg) {
        $('body').inforMessageDialog({
            title: msgTitle,
            shortMessage: shortMsg,
            detailedMessage: msg,
            dialogType: msgType
        });
    }
    function showSlideInMessage(msgType, msgTitle, msg) {
        $('body').inforSlideInMessage({
            autoDismiss: true,
            messageType: msgType,
            messageTitle: msgTitle,
            message: msg
        });
    }
    function addDialogWindow(controller) {
        var customHtml = '<div id="cpqDiv"><iframe id="cpqIframe" src="" style="height:100%;width:100%"></iframe></div>';
        var url = decodeURIComponent(ScriptUtil.GetFieldValue("WEURL"));
        _$host.append(customHtml);
        var test = $('#cpqDiv');
        var test1 = $('#cpqIframe');
        var timesRefreshed = 0;
        $('#cpqIframe').load(function () {
            if (timesRefreshed === 2) {
                $('#cpqDiv').remove();
                controller.PressKey("ENTER");
            }
            timesRefreshed++;
        });
        $('#cpqDiv').inforMessageDialog({
            title: "PCM Configurator",
            dialogType: "General",
            width: "1200",
            height: "800",
            modal: true,
            open: function (event, ui) {
                $('#cpqIframe').attr('src', url);
            },
            beforeClose: function () {
            },
            close: function (event, ui) {
                $('#cpqDiv').remove();
                controller.PressKey("F03");
            },
            buttons: {}
        });
    }
};
//# sourceMappingURL=Cpq_M3_v1.js.map