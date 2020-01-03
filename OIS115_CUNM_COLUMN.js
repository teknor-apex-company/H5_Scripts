var OIS115_CUNM_COLUMN = (function () {
    function OIS115_CUNM_COLUMN(scriptArgs) {
        this.enableSearch = false;
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
    }
    OIS115_CUNM_COLUMN.Init = function (args) {
        new OIS115_CUNM_COLUMN(args).run();
    };
    OIS115_CUNM_COLUMN.prototype.run = function () {
        this.lastRowUpdated = 0;
        var list = this.controller.GetGrid();
        var customColumnNum = list.getColumns().length + 1;
        this.newColumnID = list.getColumns().length + 1;
        ;
        this.enableSearch = customColumnNum > -1;
        this.appendColumn(list, customColumnNum);
        this.coColumnID = ListControl.GetColumnIndexByName("ORNO") + 1; //RIDN
		//this.coColumnID = ListControl.GetColumnIndexByName("ORNO");
		console.log("G----"+ListControl.GetColumnIndexByName("ORNO"));
		console.log("G----this.coColumnID----"+this.coColumnID);
        if (this.coColumnID >= 0) {
            this.populateData(list, this.newColumnID, this.coColumnID);
        }
        this.attachEvents(this.controller, list, customColumnNum);
    };
    OIS115_CUNM_COLUMN.prototype.appendColumn = function (list, columnNum) {
        var columnId = "C" + columnNum;
        var columns = list.getColumns();
        var newColumn = {
            id: columnId,
            field: columnId,
            name: "Customer Name",
            width: 150
        };
        if (columns.length < columnNum) {
            columns.push(newColumn);
        }
        list.setColumns(columns);
    };
    OIS115_CUNM_COLUMN.prototype.populateData = function (list, newColumnID, coColumnID) {
        var _this = this;
        var recordCount = 0;
        var columnId = "C" + newColumnID;
        var myRequest = new MIRequest();
        myRequest.program = "OIS100MI";
        myRequest.transaction = "GetHead";
		myRequest.record = { ORNO: ""  };
        myRequest.outputFields = ["CUNO","TEL1", "TEL2"]; 
		var requestCRS610MI = new MIRequest();
        requestCRS610MI.program = "CRS610MI";
        requestCRS610MI.transaction = "GetBasicData";
	    requestCRS610MI.record = { CUNO: "" }; 
		requestCRS610MI.outputFields = ["CUNO", "CUNM"]; 
        if (this.enableSearch) {
            var _loop_1 = function(i) {
				//console.log("G _loop_1 1");
                recordCount++;
				//console.log("G enableSearch 1 recordCount-------------" + recordCount);
				//console.log("G enableSearch 1 this_1.lastRowUpdated-------------" + this_1.lastRowUpdated);
				//console.log("G enableSearch 1 this.lastRowUpdated-------------" + this.lastRowUpdated);
                var coNumber = list.getData().getItem(i)['C' + coColumnID]; 
                if (recordCount >= this_1.lastRowUpdated) {
				console.log("G coNumber" + coNumber);
                    myRequest.record.ORNO = coNumber;
					console.log("G myRequest.record.ORNO-------------" + myRequest.record.ORNO);
                    MIService.Current.executeRequest(myRequest).then(function (response) {
                        
						//---------------------------------------------
						requestCRS610MI.record.CUNO =  response.item.CUNO ; 
						 MIService.Current.executeRequest(requestCRS610MI).then(function (response) {
                        var custName = "";
						custName = response.item.CUNM;
                       
                        var newData = {};
                       // console.log("G response.item.TEL2----" + response.item.CUNO +"------"+ response.item.CUNM);
                        newData[columnId] = custName;
                        newData["id_" + columnId] = "R" + (i + 1) + columnId;
                        $.extend(list.getData().getItem(i), newData);
                        var columns = list.getColumns();
                        list.setColumns(columns);
                    }).catch(function (response) {
                        _this.log.Error("Error on CRS610MI--" + coNumber + " : " + response.errorMessage);
                    });
						//---------------------------------------------
					}).catch(function (response) {
                        _this.log.Error("Error on OIS100MI--" + coNumber + " : " + response.errorMessage);
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
    OIS115_CUNM_COLUMN.prototype.attachEvents = function (controller, list, columnNum) {
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
    OIS115_CUNM_COLUMN.prototype.detachEvents = function () {
        this.unsubscribeReqCompleted();
    };
    return OIS115_CUNM_COLUMN;
}());
