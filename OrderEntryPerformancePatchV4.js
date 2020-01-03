/**
 * H5 Script SDK sample.
 */
/**
 *
 */
var OrderEntryPerformancePatchV4 = /** @class */ (function () {
    function OrderEntryPerformancePatchV4(args) {
        this.controller = args.controller;
    }
	
    /**
     * Script initialization function.
     */
    OrderEntryPerformancePatchV4.Init = function (args) {
        console.log("OrderEntryPerformancePatchV4 start");
        new OrderEntryPerformancePatchV4(args).run();		
    };
	
	OrderEntryPerformancePatchV4.prototype.run = function (args) {
        var controller = this.controller;

        try {
		 if (controller.GetPanelName() == "OIA101BC") {
			this.attachEvents(controller);
			console.log("Attached event");
			controller["ActiveOrderEntryPatch"] = true;
		 }
		 		 
        } catch (error) {
            console.log("Error in run:" + error);
        }

    };
	
	OrderEntryPerformancePatchV4.prototype.attachEvents = function (controller) {
      
        var _this = this;
        this.detachRequesting = controller.Requesting.On(function (e) {
            _this.onRequesting(e);
        });
        this.detachRequested = controller.Requested.On(function (e) {
            _this.onRequested(e);
        });   
		this.unsubscribeReqCompleted = controller.RequestCompleted.On(function (e) {
            _this.onRequestCompleted(e);
        });
    };
	
	OrderEntryPerformancePatchV4.prototype.onRequesting = function (e) {
		var _this = this;
		var cont = _this.controller;
		var response = cont.Response;
	};
	
	OrderEntryPerformancePatchV4.prototype.onRequested = function (args) {
        var _this = this;
		var cont = _this.controller;
		var response = cont.Response;
		
        if (_this.controller.GetPanelName() != "OIA101BC") {
			console.log("Detached Event");
            _this.detachRequesting();
            _this.detachRequested();
            _this.unsubscribeReqCompleted();
        }
		
		if (response.Panel.HasList) {
			if (cont.GetPanelName() == "OIA101BC" && cont.CMDTP != "RUN" && isNaN(cont.DialogType) && cont.CMDVAL == "ENTER") {
				cont.listopt = "pagedownScroll";
				cont.clearAllFields = true;
			}
		}
    };
	
	OrderEntryPerformancePatchV4.prototype.onRequestCompleted = function (e) {
		var _this = this;
		var cont = _this.controller;
		var response = cont.Response;
		console.log("Completed response");
	};
	
	OrderEntryPerformancePatchV4.prototype.detachEvents = function () {
        console.log("detachEvents");
		controller["ActiveOrderEntryPatch"] = false;
        this.unsubscribeReqCompleted();
    };
	
    return OrderEntryPerformancePatchV4;
}());
//# sourceMappingURL=OrderEntryPerformancePatchV4.js.map
