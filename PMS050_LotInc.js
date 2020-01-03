var PMS050_LotInc = /** @class */ (function () {
    function PMS050_LotInc(scriptArgs) {
        this.isMatch = false;
        this.lotArr = new Array();
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        this.args = scriptArgs.args;
    }
    PMS050_LotInc.Init = function (args) {
        new PMS050_LotInc(args).run();
    };
    PMS050_LotInc.prototype.run = function () {
        this.contentElement = this.controller.GetContentElement();
        this.mode = this.controller.GetMode();
        var userContext = ScriptUtil.GetUserContext();
        this.BANO = this.controller.GetValue("WHBANO");
        this.MFNO = this.controller.GetValue("WWMFNO");
        this.PRNO = this.controller.GetValue("WWPRNO");
        this.CONO = userContext['CONO'];
        this.log.Info("BANO: " + this.BANO);
        this.log.Info("MFNO: " + this.MFNO);
        this.log.Info("PRNO: " + this.PRNO);
        this.executeGetLot();
    };
    PMS050_LotInc.prototype.executeGetLot = function () {
        var _this = this;
        var myRequest = new MIRequest();
        myRequest.program = "MMS235MI";
        myRequest.transaction = "LstItmLot";
        //output
        myRequest.outputFields = ["BANO"];
        //input
        myRequest.record = { ITNO: this.PRNO, BANO: this.MFNO };
        MIService.Current.executeRequest(myRequest).then(function (response) {
            //Read results here
            for (var _i = 0, _a = response.items; _i < _a.length; _i++) {
                var item = _a[_i];
                _this.log.Info("BANO : " + item.BANO);
                if (item.BANO.substring(0, 10) === _this.MFNO) {
                    _this.isMatch = true;
                    _this.lotArr.push(item.BANO);
                }
            }
            if (_this.isMatch) {
                // pull the last item from array as it will be the latest BANO
                _this.LOT = _this.lotArr.pop();
                _this.log.Info("LOT: " + _this.LOT);
                if (_this.LOT.length > 10) {
                    _this.Inc = _this.Increment(_this.LOT.substring(10)); // get the digits after 10
                    _this.log.Info("Inc : " + _this.Inc);
                    _this.newBANO = _this.MFNO + _this.Inc;
                }
                else {
                    _this.newBANO = _this.MFNO + "001";
                }
                _this.controller.SetValue("WHBANO", _this.newBANO);
            }
            else {
                _this.newBANO = _this.MFNO + "001";
                _this.controller.SetValue("WHBANO", _this.newBANO);
            }
        })["catch"](function (response) {
            //Handle errors here
            _this.log.Error(response.errorMessage);
            if (response.errorMessage === "Record does not exist") {
                _this.newBANO = _this.MFNO + "001";
                _this.controller.SetValue("WHBANO", _this.newBANO);
            }
        });
    };
    PMS050_LotInc.prototype.Increment = function (num) {
        num = parseInt(num, 10);
        num++;
        num = ("0000" + num).substr(-3);
        return num;
    };
    return PMS050_LotInc;
}());
