var PDS100_FANO_COLUMN = (function () {
    function PDS100_FANO_COLUMN(scriptArgs) {
        this.enableSearch = false;
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
    }
    PDS100_FANO_COLUMN.Init = function (args) {
        new PDS100_FANO_COLUMN(args).run();
    };
    PDS100_FANO_COLUMN.prototype.run = function () {
        this.lastRowUpdated = 0;
        var list = this.controller.GetGrid();
        var customColumnNum = list.getColumns().length + 1;
        this.newColumnID = list.getColumns().length + 1;
        ;
        this.enableSearch = customColumnNum > -1;
        this.appendColumn(list, customColumnNum);
        this.coColumnID = ListControl.GetColumnIndexByName("MTNO") + 1; 
		console.log("G----"+ListControl.GetColumnIndexByName("MTNO"));
		console.log("G----this.coColumnID----"+this.coColumnID);
        if (this.coColumnID > 0) {
            this.populateData(list, this.newColumnID, this.coColumnID);
        }
        this.attachEvents(this.controller, list, customColumnNum);
    };
    PDS100_FANO_COLUMN.prototype.appendColumn = function (list, columnNum) {
        var columnId = "C" + columnNum;
        var columns = list.getColumns();
        var newColumn = {
            id: columnId,
            field: columnId,
            name: "On-Hand Balance",
            width: 150
        };
        if (columns.length < columnNum) {
            columns.push(newColumn);
        }
        list.setColumns(columns);
    };
    PDS100_FANO_COLUMN.prototype.populateData = function (list, newColumnID, coColumnID) {
        var _this = this;
        var recordCount = 0;
        var columnId = "C" + newColumnID;
        var myRequest = new MIRequest();
        myRequest.program = "MMS200MI";
        myRequest.transaction = "GetItmFac";
		myRequest.record = { FACI: "", ITNO: ""  };
        myRequest.outputFields = ["FANO"]; 
		var inputFACI = ScriptUtil.GetFieldValue('WWFACI');
		if (this.enableSearch) {
            var _loop_1 = function(i) {
				//console.log("G _loop_1 1");
                recordCount++;
				//console.log("G enableSearch 1 recordCount-------------" + recordCount);
				//console.log("G enableSearch 1 this_1.lastRowUpdated-------------" + this_1.lastRowUpdated);
				//console.log("G enableSearch 1 this.lastRowUpdated-------------" + this.lastRowUpdated);
                var MTNO = list.getData().getItem(i)['C' + coColumnID];
                if (recordCount >= this_1.lastRowUpdated) {
                    myRequest.record.FACI = inputFACI;
					myRequest.record.ITNO = MTNO;
					//console.log("G myRequest.record.ORNO-------------" + myRequest.record.ORNO);
                    MIService.Current.executeRequest(myRequest).then(function (response) {
                        
						//---------------------------------------------
						var onhand = "";
						onhand = response.item.FANO;
                        var newData = {};
                        newData[columnId] = onhand;
                        newData["id_" + columnId] = "R" + (i + 1) + columnId;
                        $.extend(list.getData().getItem(i), newData);
                        var columns = list.getColumns();
                        list.setColumns(columns);
                   
						//---------------------------------------------
					}).catch(function (response) {
                        _this.log.Error("Error on MMS200MI--" + MTNO + " : " + response.errorMessage);
                    });
                }
            };
            var this_1 = this;
            for (var i = 0; i < list.getData().getLength(); i++) {
				//console.log("G INSIDE FOR _loop_1 1");
                _loop_1(i);
            }
            this.lastRowUpdated = recordCount;
			//console.log("G lastRowUpdated----" + this.lastRowUpdated);
        }
    };
    PDS100_FANO_COLUMN.prototype.attachEvents = function (controller, list, columnNum) {
        var _this = this;
        this.unsubscribeReqCompleted = controller.RequestCompleted.On(function (e) {
            if (e.commandType === "PAGE" && e.commandValue === "DOWN") {
                if (_this.coColumnID > -1) {
                    _this.populateData(list, _this.newColumnID, _this.coColumnID);
                }
            }
            else {
                _this.detachEvents();
            }
        });
    };
    PDS100_FANO_COLUMN.prototype.detachEvents = function () {
        this.unsubscribeReqCompleted();
    };
    return PDS100_FANO_COLUMN;
}());
