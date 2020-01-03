var MMS080_B_DSDTColumn = (function () {
    function MMS080_B_DSDTColumn(scriptArgs) {
        this.enableSearch = false;
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
    }
    MMS080_B_DSDTColumn.Init = function (args) {
        new MMS080_B_DSDTColumn(args).run();
    };
    MMS080_B_DSDTColumn.prototype.run = function () {
        console.log("--------------------------........................in run"  );
        var _this = this;
        this.lastRowUpdated = 0;
        var list = this.controller.GetGrid();
        var customColumnNum = list.getColumns().length + 1;
        var ymdDate = "";
        var plantDate = "";
        var orca = 0;
        var orcaIndex = 0;
        var ornoIndex = 0;
        var lineIndex = 0;
        var sfxIndex = 0;
        var dsdt = "";
        var sortingOrder = this.controller.GetSortingOrder();
        this.orcaIndex = ListControl.GetColumnIndexByName('ORCA') +1; 
        this.ornoIndex= ListControl.GetColumnIndexByName('RIDN')+ 1; 
        this.lineIndex= ListControl.GetColumnIndexByName('RIDL') + 1; 
        this.sfxIndex= ListControl.GetColumnIndexByName('RIDX')+ 1;  
   if((this.sfxIndex >0) &(this.lineIndex >0) & (this.ornoIndex >0) ){
        //column 1
        customColumnNum =  list.getColumns().length + 1;        
        this.newColumnID = list.getColumns().length + 1;
        this.enableSearch = customColumnNum > -1;
        this.appendColumn(list, customColumnNum,  "Dep dt");
       this.newColumnID = customColumnNum;
        if (this.orcaIndex >0) {     
      this.showDSDT(list, this.newColumnID);
        }
        this.attachEvents(this.controller, list, customColumnNum);
  }else{
        console.log("Order number, Order line and Line Sfx needs to be need to be in the browse to view the Dep Date"  );
    } 
    };
    MMS080_B_DSDTColumn.prototype.appendColumn = function (list, columnNum, name) {
        console.log("--------------------------........................in append column"  );
        var columnId = "C" + columnNum;
        var columns = list.getColumns();
        var newColumn = {
            id: columnId,
            field: columnId, 
           name: name,
            width: 150
        };
        if (columns.length < columnNum) {
            columns.push(newColumn);
        }
        list.setColumns(columns);
    };  
    MMS080_B_DSDTColumn.prototype.showDSDT = function (list, newColumnID) {
        console.log("--------------------------........................in showDSDT");
        var _this = this;
        var recordCount = 0;
        var columnId =   "C" + newColumnID;        
        const userContext = ScriptUtil.GetUserContext();
             // API Call time with value entered
            var myRequest = new MIRequest();
            myRequest.program = "OIS100MI";
            myRequest.transaction = "GetLine2";
            // output
            myRequest.outputFields = [ "DSDT"];
            // input
            myRequest.record = {
                ORNO: "",
                PONR: "",
                POSX: ""
            };
        if (this.enableSearch) {            
            var _loop_1 = function (i) {
                var orcaIndex = ListControl.GetColumnIndexByName('ORCA') +1; 
                var orcaID = "C" +  orcaIndex;
                var orcaColumnValue = list.getData().getItem(i)[orcaID];
            if(orcaColumnValue === "311"){
              this.ornoIndex= ListControl.GetColumnIndexByName('RIDN')+ 1; 
              this.lineIndex= ListControl.GetColumnIndexByName('RIDL') + 1; 
              this.sfxIndex= ListControl.GetColumnIndexByName('RIDX')+ 1; 
              var ornoID = "C" +  this.ornoIndex;
              var lineID = "C" +  this.lineIndex;
              var sfxID = "C" +  this.sfxIndex;              
              var ridnColumnValue = list.getData().getItem(i)[ornoID];
              var ridlColumnValue = list.getData().getItem(i)[lineID];
              var ridxColumnValue = list.getData().getItem(i)[sfxIndex];               
                recordCount++;
                myRequest.record.ORNO = ridnColumnValue;
                myRequest.record.PONR = ridlColumnValue;                
                myRequest.record.POSX = ridxColumnValue;
                MIService.Current.executeRequest(myRequest).then(function (response) {                    
                    var dsdt = "";
                    dsdt = response.item.DSDT;                    
                   var myDate  = dsdt.substring(4, 6)+  dsdt.substring(6) + dsdt.substring(2, 4) ;
                    var newData = {};
                    newData[columnId] = myDate;
                    newData["id_" + columnId] = "R" + (i + 1) + columnId;
                    $.extend(list.getData().getItem(i), newData);
                    var columns = list.getColumns();
                    list.setColumns(columns);
                   
                }).catch(function (response) {
                    console.log("SOMETHING WENT HORRIBLY WRONG--" + " : " + response.errorMessage);
                });
            };
        }
            var this_1 = this;
            for (var i = 0; i < list.getData().getLength(); i++) {
                _loop_1(i);
            }
            this.lastRowUpdated = recordCount;

        } else {
            console.log(" THIS IS NOT ENABLED----");
        }
    };   
    MMS080_B_DSDTColumn.prototype.convertDSDT = function (dsDate) {
        console.log("---------------------------------->CONVERTING DSDATE " );
        var date = dsDate;
        var dd = "";
        var mm = "";
        var yy = "";
                    yy = date.substring(2, 4);
                    mm = date.substring(4, 6);
                    dd = date.substring(6);                   
                    yy = "20" + yy;
                   dsDate =  yy + mm + dd + "";
                    console.log("----------------------------------> yy + mm + dd   " +  yy + mm + dd);
                    return dsDate;
    }   
    MMS080_B_DSDTColumn.prototype.attachEvents = function (controller, list, columnNum) {
        console.log("--------------------------........................attaching events"  );
        var _this = this;
        this.unsubscribeReqCompleted = controller.RequestCompleted.On(function (e) {
            if (e.commandType === "PAGE" && e.commandValue === "DOWN") {
               //if (_this.pldtColumnID > -1) {
                this.ornoIndex= ListControl.GetColumnIndexByName('RIDN')+ 1; 
                this.lineIndex= ListControl.GetColumnIndexByName('RIDL') + 1; 
                this.sfxIndex= ListControl.GetColumnIndexByName('RIDX')+ 1;  
           if((this.sfxIndex >0) &(this.lineIndex >0) & (this.ornoIndex >0) ){
                   this.showDSDT(list, columnNum);
                }
            }
            else {
                _this.detachEvents();
            }
        });
    };
    MMS080_B_DSDTColumn.prototype.detachEvents = function () {
        console.log("--------------------------........................detachEvents "  );
        this.unsubscribeReqCompleted();
    };
    return MMS080_B_DSDTColumn;
}());