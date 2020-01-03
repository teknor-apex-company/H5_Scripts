var PMS070E_ConvertTime = /** @class */ (function () {
    function PMS070E_ConvertTime(scriptArgs) {
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.args = scriptArgs.args;
    }
    PMS070E_ConvertTime.Init = function (args) {
        new PMS070E_ConvertTime(args).run();
    };
    PMS070E_ConvertTime.prototype.run = function () {
        this.contentElement = this.controller.GetContentElement();
        this.mode = this.controller.GetMode();
        this.addlableAndTextBox();
        this.addButton();
    };
    PMS070E_ConvertTime.prototype.addlableAndTextBox = function () {
        this.valWOUPIT = this.controller.GetValue("WOUPIT");
        this.valVOUPIT = this.controller.GetValue("VOUPIT");
        this.valWOUSET = this.controller.GetValue("WOUSET");
        this.valVOUSET = this.controller.GetValue("VOUSET");
        var labelRunTm = new LabelElement();
        labelRunTm.Name = "runTimeLable";
        labelRunTm.Value = "Used mch run tm (Min)";
        labelRunTm.Position = new PositionElement();
        labelRunTm.Position.Top = 11;
        labelRunTm.Position.Left = 72;
        labelRunTm.Position.Width = 16;
        this.contentElement.AddElement(labelRunTm);
        var textAAUPIT = new TextBoxElement();
        textAAUPIT.Name = "AAUPIT";
        textAAUPIT.Value = "";
        textAAUPIT.Position = new PositionElement();
        textAAUPIT.Position.Top = 11;
        textAAUPIT.Position.Left = 88;
        textAAUPIT.Position.Width = 8;
        if (this.mode === '5') {
            textAAUPIT.IsEnabled = false;
        }
        if (this.valWOUPIT != null && this.valWOUPIT != 0) {
            textAAUPIT.Value = (this.valWOUPIT * 60).toString();
        }
        this.contentElement.AddElement(textAAUPIT);
        var labelAccRunTm = new LabelElement();
        labelAccRunTm.Name = "accRunTimeLable";
        labelAccRunTm.Value = "Used mch run tm accumulated";
        labelAccRunTm.Position = new PositionElement();
        labelAccRunTm.Position.Top = 12;
        labelAccRunTm.Position.Left = 72;
        labelAccRunTm.Position.Width = 16;
        this.contentElement.AddElement(labelAccRunTm);
        var textBBUPIT = new TextBoxElement();
        textBBUPIT.Name = "BBUPIT";
        textBBUPIT.Value = "";
        textBBUPIT.Position = new PositionElement();
        textBBUPIT.Position.Top = 12;
        textBBUPIT.Position.Left = 88;
        textBBUPIT.Position.Width = 8;
        textBBUPIT.IsEnabled = false;
        if (this.valVOUPIT != null && this.valVOUPIT != 0) {
            textBBUPIT.Value = parseFloat((this.valVOUPIT / 60).toString()).toFixed(2);
        }
        else {
            textBBUPIT.Value = this.valVOUSET.toString();
        }
        this.contentElement.AddElement(textBBUPIT);
        var labelSetup = new LabelElement();
        labelSetup.Name = "setupLable";
        labelSetup.Value = "Used mch setup (Min)";
        labelSetup.Position = new PositionElement();
        labelSetup.Position.Top = 13;
        labelSetup.Position.Left = 72;
        labelSetup.Position.Width = 16;
        this.contentElement.AddElement(labelSetup);
        var textAAUSET = new TextBoxElement();
        textAAUSET.Name = "AAUSET";
        textAAUSET.Value = "";
        textAAUSET.Position = new PositionElement();
        textAAUSET.Position.Top = 13;
        textAAUSET.Position.Left = 88;
        textAAUSET.Position.Width = 8;
        if (this.mode === '5') {
            textAAUSET.IsEnabled = false;
        }
        if (this.valWOUSET != null && this.valWOUSET != 0) {
            textAAUSET.Value = (this.valWOUSET * 60).toString();
        }
        this.contentElement.AddElement(textAAUSET);
        var labelAccSetup = new LabelElement();
        labelAccSetup.Name = "accSetupLable";
        labelAccSetup.Value = "Used mch setup tm accumulated";
        labelAccSetup.Position = new PositionElement();
        labelAccSetup.Position.Top = 14;
        labelAccSetup.Position.Left = 72;
        labelAccSetup.Position.Width = 16;
        this.contentElement.AddElement(labelAccSetup);
        var textBBUSET = new TextBoxElement();
        textBBUSET.Name = "BBUSET";
        textBBUSET.Value = "";
        textBBUSET.Position = new PositionElement();
        textBBUSET.Position.Top = 14;
        textBBUSET.Position.Left = 88;
        textBBUSET.Position.Width = 8;
        textBBUSET.IsEnabled = false;
        if (this.valVOUSET != null && this.valVOUSET != 0) {
            textBBUSET.Value = parseFloat((this.valVOUSET / 60).toString()).toFixed(2);
        }
        else {
            textBBUSET.Value = this.valVOUSET.toString();
        }
        this.contentElement.AddElement(textBBUSET);
    };
    PMS070E_ConvertTime.prototype.addButton = function () {
        var _this = this;
        var buttonConvert = new ButtonElement();
        buttonConvert.Name = "convertButton";
        buttonConvert.Value = "Convert & Update";
        buttonConvert.Position = new PositionElement();
        buttonConvert.Position.Top = 15;
        buttonConvert.Position.Left = 80;
        buttonConvert.Position.Width = 10;
        if (this.mode === '5')
            buttonConvert.IsEnabled = false;
        var $button = this.contentElement.AddElement(buttonConvert);
        $button.click({}, function () {
            var $textXXUPIT = $("#AAUPIT");
            var $textXXUSET = $("#AAUSET");
            _this.UPIT = $textXXUPIT.val();
            _this.USET = $textXXUSET.val();
            if (_this.UPIT != null && _this.UPIT != 0)
                ScriptUtil.SetFieldValue("WOUPIT", parseFloat((_this.UPIT / 60).toString()).toFixed(2));
            if (_this.USET != null && _this.USET != 0)
                ScriptUtil.SetFieldValue("WOUSET", parseFloat((_this.USET / 60).toString()).toFixed(2));
        });
    };
    return PMS070E_ConvertTime;
}());