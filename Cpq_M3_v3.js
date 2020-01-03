var Cpq_M3_v3 = /** @class */ (function () {
    function Cpq_M3_v3(scriptArgs) {
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.scriptName = 'Cpq_M3_v3';
        this.maxRefresh = 2;
    }
    Cpq_M3_v3.Init = function (scriptArgs) {
        new Cpq_M3_v3(scriptArgs).run();
    };
    Cpq_M3_v3.prototype.run = function () {
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
    Cpq_M3_v3.prototype.addDialogWindow = function (url) {
        var _this = this;
        var $host = this.controller.ParentWindow;
        var customHtml = "\n            <div id=\"cpqDiv\">\n                <iframe id=\"cpqIframe\"\n                        src=\"\"\n                        style=\"height:100%; width:100%\">\n                </iframe>\n            </div>\n        ";
        $host.append(customHtml);
        var $cpqDiv = $('#cpqDiv');
        var $cpqIframe = $('#cpqIframe');
        var timesRefreshed = 0;
        $cpqIframe.on('load', function () {
            if (timesRefreshed === _this.maxRefresh) {
                $cpqIframe.off('load');
                $cpqDiv.remove();
                _this.controller.PressKey("ENTER");
            }
            timesRefreshed++;
        });
        // Sets the dialog height to 65% of the host height
        var dialogHeight = $host.height() * 0.65;
        // Sets the dialog width to 90% or 70% depending on the host width
        var dialogWidth = $host.width() < 1300 ? $host.width() * 0.90 : $host.width() * 0.7;
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
    Cpq_M3_v3.prototype.showMessageDialog = function (dialogType, header, detailedMessage, shortMessage) {
        ConfirmDialog.ShowMessageDialog({
            header: header,
            detailedMessage: detailedMessage,
            shortMessage: shortMessage,
            dialogType: dialogType
        });
    };
    return Cpq_M3_v3;
}());
//# sourceMappingURL=Cpq_M3_v3.js.map