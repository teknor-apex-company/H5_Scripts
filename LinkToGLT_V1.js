/**
 * @author Erik Åsberg
 * @version 1 (For GDE)
 * @since 2018-12-18
 *
 * @description
 *      This shortcut script will let you navigate to GLT after selecting a row in one of the following, supported, programs:
 *      MMS235B, MWS060B, OIS300B, PMS100B, PPS200B
 * @arguments
 *      1. Ming.le lid for GLT instance
 * @argument example
 *      lid://infor.m3glt.m3glt
 */
var LinkToGLT_V1 = (function () {
    function LinkToGLT_V1(scriptArgs) {
        this.scriptName = "LinkToGLT_V1";
        this.args = scriptArgs.args;
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
    }
    /**
     * Script initialization function.
     */
    LinkToGLT_V1.Init = function (scriptArgs) {
        new LinkToGLT_V1(scriptArgs).run();
    };
    /**
     * Starting point of every H5 script
     */
    LinkToGLT_V1.prototype.run = function () {
        this.log.Info("Running...");
        var _a = this.splitAndTrimArguments(this.args), baseUrl = _a[0];
        if (!baseUrl) {
			baseUrl = "lid://infor.m3glt.m3glt";
		}
		/* 
		if (!baseUrl) {
            this.showMessageDialog('missingArgument');
            return;
        }
		*/
		
		if (!this.isValidLid(baseUrl)) {
			this.showMessageDialog('missingLid');
            return;
		}
		
		// Generate/get the link to GLT
        var myDrillback = this.getDrillbackToGLT(baseUrl);
        if (!myDrillback) {
            return;
        }
		
		infor.companyon.client.sendPrepareDrillbackMessage(myDrillback);
		this.log.Info(myDrillback);
		
        this.log.Info("Init End");
    };
	
	LinkToGLT_V1.prototype.isValidLid = function (gltLid) {
		if ((typeof gltLid == "undefined") || (gltLid == null) || (gltLid==""))
			return false;
		
		var re = /^lid:\/\/infor\.m3glt\.[a-zA-z0-9]{1,20}$/;
		return (re.test(gltLid));
	};
	
	LinkToGLT_V1.prototype.getDrillbackToGLT = function (gltLid) {
        var config = this.getProgramConfig();
        if ((!gltLid) || (!config)){
            this.showMessageDialog('noConfig');
            return '';
        }
  
        // Replace {templates} dynamic
        for (var i = 0; i < config.columns.length; i++) {
            var field = config.columns[i];
            if (field.length > 4) {
                //If field length is > 4 => field is an input field
                var fieldValue = ScriptUtil.GetFieldValue(field);
                if (!fieldValue) {
                    this.showMessageDialog('noFieldValue', field);
                    return '';
                }
                config.url = config.url.replace("{" + field + "}", fieldValue);
            }
            else {
                // Else it is a list field
                var columnValueArr = ListControl.ListView.GetValueByColumnName(field);
                if (!columnValueArr.length || columnValueArr.length > 1) {
                    this.showMessageDialog('noColumnValue');
                    return '';
                }
                config.url = config.url.replace("{" + field + "}", columnValueArr[0]);
            }
            gltURL = config.url;
        }
		return "?LogicalId="+ gltLid + "&/" + gltURL;
    };
	
    LinkToGLT_V1.prototype.getProgramConfig = function () {
        // Get the current program name
        var currentProgram = this.controller.GetProgramName(), programConfig;
        // Different URL's to GLT depending on current program
        var itemAndLot = {
            url: "search/Lot?ItemNumber={ITNO}&LotNumber={BANO}&Limit=100",
            columns: ['ITNO', 'BANO'],
        }, panelItemAndLot = {
            url: "search/Lot?ItemNumber={W1ITNO}&LotNumber={BANO}&Limit=100",
			columns: ['BANO', 'W1ITNO']
        }, salesOrder = {
            url: "search/Sale?OrderNumber={ORNO}&Limit=100",
            columns: ['ORNO']
        }, orderAndProduct = {
            url: "search/Production?MoNumber={MFNO}&ItemNumber={PRNO}&Limit=100",
            columns: ['MFNO', 'PRNO']
        }, purchaseOrder = {
            url: "search/Purchase?OrderNumber={PUNO}&Limit=100",
            columns: ['PUNO']
        };
        // Supported programs
        var supportedPrograms = [{
                prog: 'MWS060',
                config: itemAndLot
            }, {
                prog: 'MMS235',
                config: panelItemAndLot
            }, {
                prog: 'OIS300',
                config: salesOrder
            }, {
                prog: 'PMS100',
                config: orderAndProduct
            }, {
                prog: 'PPS200',
                config: purchaseOrder
            }
        ];
        for (var i = 0; i < supportedPrograms.length; i++) {
            if (supportedPrograms[i].prog === currentProgram) {
                programConfig = supportedPrograms[i].config;
                break;
            }
        }
        return programConfig;
    };
    LinkToGLT_V1.prototype.showMessageDialog = function (state, field) {
        var self = this;
        if (state === 'missingArgument') {
            $('body').inforMessageDialog({
                title: 'Missing Argument',
                dialogType: 'Alert',
                shortMessage: 'H5-Script:' + self.scriptName,
                detailedMessage: 'Please add the lid for GLT as the script argument in order to use this script. Lid should be on the format "lid://infor.m3glt.<uniqueID>", ex. lid://infor.m3glt.m3glt'
            });
        } else if (state === 'missingLid') {
            $('body').inforMessageDialog({
                title: 'Invalid Argument',
                dialogType: 'Alert',
                shortMessage: 'H5-Script:' + self.scriptName,
                detailedMessage: 'Script argument is not valid, lid should be on the format "lid://infor.m3glt.<uniqueID>", ex. lid://infor.m3glt.m3glt'
            });
        } else if (state === 'noConfig') {
            $('body').inforMessageDialog({
                dialogType: 'Alert',
                title: 'H5-Script: ' + self.scriptName,
                shortMessage: 'Program Not Supported',
                detailedMessage: 'The current program is not supported by this script. Please remove this shortcut from this program/panel.'
            });
        } else if (state === 'noFieldValue') {
            $('body').inforMessageDialog({
                dialogType: 'Alert',
                title: 'H5-Script: ' + self.scriptName,
                shortMessage: 'Missing Value',
                detailedMessage: 'No value could be found for the field: ' + field + '.'
            });
        } else if (state === 'noColumnValue') {
            $('body').inforMessageDialog({
                dialogType: 'Alert',
                title: 'H5-Script: ' + self.scriptName,
                shortMessage: 'Row Selection',
                detailedMessage: 'You need to select a row from the list.'
            });
        }
    };
    /**
     * Split a string into substrings using the specified separator and return them as an array. Also remove the whitespace from the beginning and end of each string.
     * @param {string} args The string that you want to split
     */
    LinkToGLT_V1.prototype.splitAndTrimArguments = function (args) {
        return $.map(args.split(","), function (index) {
            return $.trim(index);
        });
    };
    return LinkToGLT_V1;
})();