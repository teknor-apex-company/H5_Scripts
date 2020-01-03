/**
 * Last updated 2019-03-07
 *
 * @class Cpq_M3_v4
 */
var Cpq_M3_v4 = /** @class */ (function () {
    function Cpq_M3_v4(scriptArgs) {
        this.fn = function (event) {
            var messageParams = this;
            var url = messageParams.url, compareUrl = messageParams.compareUrl, $cpqDiv = messageParams.$cpqDiv, $cpqIframe = messageParams.$cpqIframe, controller = messageParams.controller;
            // Check origin url
            if (event.origin !== compareUrl) {
                return;
            }
            // Validate data
            var response = event.data;
            if (!response) {
                return;
            }
            if (response.source !== 'infor.cpq.configurator' && response.type !== 'configurationcomplete' || !response.payload || !response.payload.redirecturl) {
                return;
            }
            var urlParams = new URLSearchParams(url);
            if (response.payload.redirecturl !== urlParams.get('RedirectUrl')) {
                return;
            }
            $cpqIframe.off('load');
            $cpqDiv.remove();
            this.controller.PressKey("ENTER");
            window.removeEventListener('message', fnBind, false);
        };
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.scriptName = 'Cpq_M3_v4';
    }
    Cpq_M3_v4.Init = function (scriptArgs) {
        new Cpq_M3_v4(scriptArgs).run();
    };
    Cpq_M3_v4.prototype.run = function () {
        this.log.Info("Init Start");
        var panelHeader = this.controller.RenderEngine.PanelHeader;
        if (panelHeader !== 'PDS650/E') {
            this.log.Error('Cpq_M3 script may only be used on PDS650/E panel');
            this.showMessageDialog('Error', 'Invalid script', 'Cpq_M3 script may only be used on PDS650/E panel');
            return;
        }
        var url = ScriptUtil.GetFieldValue("WEURL");
        if (!url) {
            return;
        }
        this.addDialogWindow(url);
        this.log.Info("Init End");
    };
    Cpq_M3_v4.prototype.addDialogWindow = function (url) {
        var _this = this;
        var $host = this.controller.ParentWindow;
        var customHtml = "\n            <div id=\"cpqDiv\">\n                <iframe id=\"cpqIframe\"\n                        src=\"\"\n                        style=\"height:100%; width:100%\">\n                </iframe>\n            </div>\n        ";
        $host.append(customHtml);
        var $cpqDiv = $('#cpqDiv');
        var $cpqIframe = $('#cpqIframe');
        var messageParams = {
            url: url,
            compareUrl: this.getUrlFromString(url),
            $cpqDiv: $cpqDiv,
            $cpqIframe: $cpqIframe,
            controller: this.controller,
        };
        fnBind = this.fn.bind(messageParams);
        window.addEventListener('message', fnBind, false);
        // Sets the dialog height to 65% of the host height
        var dialogHeight = $host.height() * 0.75;
        // Sets the dialog width to 90% of the host width
        var dialogWidth = $host.width() * 0.90;
        $cpqDiv.inforMessageDialog({
            title: "CPQ Configurator",
            dialogType: "General",
            height: dialogHeight,
            width: dialogWidth,
            modal: true,
            open: function (event, ui) {
                $cpqIframe.attr('src', url);
            },
            beforeClose: function () { },
            close: function (event, ui) {
                $cpqDiv.remove();
                _this.controller.PressKey("F03");
            },
            buttons: []
        });
    };
    Cpq_M3_v4.prototype.showMessageDialog = function (dialogType, header, detailedMessage, shortMessage) {
        ConfirmDialog.ShowMessageDialog({
            header: header,
            detailedMessage: detailedMessage,
            shortMessage: shortMessage,
            dialogType: dialogType
        });
    };
    Cpq_M3_v4.prototype.getUrlFromString = function (url) {
        var pathArray = url.split('/');
        return pathArray[0] + "//" + pathArray[2];
    };
    return Cpq_M3_v4;
}());
var MessageParams = /** @class */ (function () {
    function MessageParams() {
    }
    return MessageParams;
}());
var fnBind;
//# sourceMappingURL=Cpq_M3_v4.js.map