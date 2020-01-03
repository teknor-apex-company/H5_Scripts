var PMS230B_ScheduleButton(scriptArgs) = /** @class */ (function () {
	  function PMS230B_ScheduleButton(scriptArgs) {
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.args = scriptArgs.args;
    }
	   PMS230B_ScheduleButton.Init = function (args) {
        new PMS230B_ScheduleButton(args).run();
    };
	 PMS230B_ScheduleButton.prototype.run = function () {
        this.contentElement = this.contoller.GetContentElement();
        this.mode = this.controller.GetMode();
    
        this.addButton();
    };
		
	
	    PMS230B_ScheduleButton.prototype.addButton = function () {
        var _this = this;
        var buttonSchedule = new ButtonElement();
        buttonSchedule.Name = "Schedule";
        buttonSchedule.Value = "Schedule";
        buttonSchedule.Position = new PositionElement();
        buttonSchedule.Position.Top = 15;
        buttonSchedule.Position.Left = 80;
        buttonSchedule.Position.Width = 10;
        if (this.mode === '5'){
           // buttonSchedule.IsEnabled = false;
		}
		}
		
        var $button = this.contentElement.AddElement(buttonSchedule);
 
    };
	());
}