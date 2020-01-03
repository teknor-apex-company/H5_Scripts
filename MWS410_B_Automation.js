var MWS410_B_Automation = new function() {
	this.Init = function(scriptArgs) {
		this.controller = scriptArgs.controller;
		this.log = scriptArgs.log;
		this.args = scriptArgs.args;
		this.contentElement = this.controller.GetContentElement();
        var dlix = "";
		this.addAutomationButton();
	};
	this.addAutomationButton = function() {    
        var _this = this;
		var buttonElement = new ButtonElement();
		buttonElement.Name = "addressLabelButton";
		buttonElement.Value = "Cert";
		buttonElement.Position = new PositionElement();
		buttonElement.Position.Top = 7;
		buttonElement.Position.Left = 22;
		buttonElement.Position.Width = 5;
		var $button = this.contentElement.AddElement(buttonElement);
        $button.click({}, function () {
            _this.log.Info("   JUST CLICKED-----------------------------------...");  
            var dlixIndex = ListControl
							.GetColumnIndexByName("DLIX"); 
            var dlix = ListControl.ListView.GetValueByColumnIndex(dlixIndex);
            _this.dlix = ListControl.ListView.GetValueByColumnIndex(dlixIndex);
            _this.log.Info("   JUST dlix-----------------------------------..." + dlix);  
          var auto = new MFormsAutomation();
            auto.addStep(ActionType.Run, "QMS600");
            auto.addStep(ActionType.Key, "ENTER");
			auto.addField("WFRIDI", dlix);
			auto.addField("WTRIDI", dlix);
           // auto.addStep(ActionType.ListOption, "2");
            var uri = auto.toEncodedUri();
            ScriptUtil.Launch(uri);
        });
	
	};


	return MWS410_B_Automation;
}();