var MWS411_B_PrintAddressLabel = new function() {
	this.Init = function(scriptArgs) {
		this.controller = scriptArgs.controller;
		this.log = scriptArgs.log;
		this.args = scriptArgs.args;
		this.contentElement = this.controller.GetContentElement();
		var apiResponse = [];
		var popn = "";
		var cuor = "";
		var whlo = "";
		var dlix = "";
		var copy = "1";
		
		this.addM3APIDialogButton();
	};
	this.addM3APIDialogButton = function() {
		var _this = this;
		var buttonElement = new ButtonElement();
		buttonElement.Name = "addressLabelButton";
		buttonElement.Value = "Print Address Label";
		buttonElement.Position = new PositionElement();
		buttonElement.Position.Top = 1;
		buttonElement.Position.Left = 10;
		buttonElement.Position.Width = 5;
		var $button = this.contentElement.AddElement(buttonElement);

		$button
				.click(
						{},
						function() {						
							var dlixIndex = ListControl
							.GetColumnIndexByName("DLIX");
							// time to get info from list
							var ridnIndex = ListControl
									.GetColumnIndexByName("RIDN");
									var ridlIndex = ListControl
									.GetColumnIndexByName("RIDL");

							
							// check if column was found
							if (parseInt(ridnIndex) < 0) {
								_this.log.Info("Column not found");
							} else {
								var dlix = ListControl.ListView.GetValueByColumnIndex(dlixIndex);
								_this.dlix = ListControl.ListView.GetValueByColumnIndex(dlixIndex);
								
								var itnoIndex = ListControl.GetColumnIndexByName("ITNO");
								var itno = ListControl.ListView.GetValueByColumnIndex(itnoIndex);
								var ridn = ListControl.ListView
										.GetValueByColumnIndex(ridnIndex);
								
										var ridl = ListControl.ListView
										.GetValueByColumnIndex(ridlIndex);
										
							 


								if (ridn === "" || ridn == "") {
									_this.controller
											.ShowMessage("The order number can not be found, ");
								} else {
									//Call OIS100
									_this.callOIS100MI(ridn, ridl, itno, parseInt(dlix));
								}
							}
						});
	};
	this.prtAddrLabel = function(dlix, panr, copy) {	
		var _this = this;	
		_this.log.Info("in printing "+copy+" labels---------------------> ");
			//BEGIN
			// Init API Call
			var myRequest = new MIRequest();
			myRequest.program = "MWS423MI";
			myRequest.transaction = "PrtAddrLabel";
			// output
		//	myRequest.outputFields = [];

			// input
			myRequest.record = {
				DLIX : parseInt(_this.dlix),
				WHLO : _this.whlo,
				PANR : panr,
				COPY: 1
			}; 
			for (var i = 0; i < copy; i++) {
			// Calling API
			MIService.Current.executeRequest(myRequest).then(function(response) {
				// Read results here
				_this.log.Info("PRINTED LABEL   ");
			  
			})["catch"](function(response) {
				_this.log.Info("LABEL DID NOT PRINT"); 
				_this.controller.ShowMessage("The label did not print.");
				// Handle errors here
				 _this.log.Info(response.errorMessage);  
			}); 
		}
			 
			//END   
		// end call
	}
	this.callOIS100MI = function(ridn, ridl, itno, dlix) {		
		var _this = this;
	
		var potx = 0;
		var items;
		 
	
		// API Call time with value entered
		var myRequest = new MIRequest();
		myRequest.program = "OIS100MI";
		myRequest.transaction = "GetLine";
		// output
		myRequest.outputFields = [ "POPN",  "CUOR", "WHLO" ];
		// input
		myRequest.record = {
			ORNO : ridn,
			PONR : ridl
		};
		// Calling API
		MIService.Current
				.executeRequest(myRequest)
				.then(
						function(response) {
							items = response[0];
						 
									for (var _i = 0, _a = response.items; _i < _a.length; _i++) {
										
										var item = _a[_i];   
									       
									_this.popn = item.POPN;
									_this.cuor = item.CUOR;				
									 popn = item.POPN;
									 cuor = item.CUOR;			
									   _this.whlo = item.WHLO;
								
								}																 
								//Display								
							 _this.showDialog(popn, cuor, itno, parseInt(dlix));
						})["catch"](function(response) {
			// Handle errors here
			_this.log.Info("line 147" );   	
			_this.log.Error(response.errorMessage);
			_this.controller.ShowMessage(response.errorMessage);
		});
		// end call
		 
	}
	this.pressEnterAsync = function () {
        var _this = this;
        setTimeout(function () { _this.controller.PressKey("ENTER"); }, 0);
	};
	this.callMWS423MI = function (dlix) {
		var _this = this; 
		//BEGIN
	 	// Object to store response	 
		// API Parameters
		var inou = "1";
		var paco = "0";
		var res = "";
		
		// Init API Call
		var myRequest = new MIRequest();
		myRequest.program = "MWS423MI";
		myRequest.transaction = "LstPackages";
		// output
		myRequest.outputFields = [ "PANR" ];
		// input
		myRequest.record = {
			DLIX : parseInt(dlix),
			INOU : inou,
			PACO : paco
		};
		// Calling API
	
		MIService.Current.executeRequest(myRequest).then(function(response) {
		
			// Read results here
			for (var _i = 0, _a = response.items; _i < _a.length; _i++) {
				// Get individual LINES
				var item = _a[_i];                
				res = item.PANR;		
				_this.log.Info("    IN MWS423 SUCESS----------------------------2--------------...");   
			} 				 
			   _this.saveRecord( parseInt(dlix), res);
			 
				 		 
				
		})["catch"](function(response) {
			_this.log.Info("line 191" );   	
			// Handle errors here
			_this.log.Info(response.errorMessage );   	
			 _this.controller.ShowMessage(response.errorMessage);
			 
		});  
		//END   
	};
	
	this.addRecord = function (dlix, panr ) {
		var _this = this;
		
		// Init API Call
		var myRequest = new MIRequest();
		myRequest.program = "CUSEXTMI";
	 
		myRequest.transaction = "AddFieldValue";
		_this.log.Info("myRequest.transaction  ------------------------------..." + myRequest.transaction ); 
		// output
		//myRequest.outputFields = [];
		// input
		myRequest.record = {
			FILE : "MPTRNS",
			PK01 : "0",
			PK02 : _this.whlo,
			PK03: parseInt(dlix),
			PK04: panr,
			A030: _this.cuor,
			A130: _this.popn
		};
		// Calling API
		MIService.Current.executeRequest(myRequest).then(function(response) {
			_this.log.Info("RECORD ADD------------------------SUCCESS>"  ); 
			_this.prtAddrLabel(parseInt(dlix), panr, _this.copy);	
		})["catch"](function(response) {			 
			_this.log.Info(" RECORD Add ---------FAIL---------->" + response.errorMessage); 
			
		});
		
		 
	};
	this.saveRecord = function (dlix, panr ) {
		var _this = this;
	  var saved = false;
		// Init API Call
		var myRequest = new MIRequest();
		myRequest.program = "CUSEXTMI";
		myRequest.transaction = "ChgFieldValue";	 
		_this.log.Info("   checkRecord------------myRequest.transaction  ------------------------------..." + myRequest.transaction ); 
		// output
		myRequest.outputFields = [""];
		// input
		_this.cuor  = document.getElementById("cuor").value;
		_this.copy = document.getElementById("copy").value;
		_this.popn = document.getElementById("popn").value;
		myRequest.record = {
			FILE : "MPTRNS",
			PK01 : "0",
			PK02 : _this.whlo,
			PK03: parseInt(dlix),
			PK04: panr,
			A030: _this.cuor,
			A130: _this.popn
		};

		// Calling API
		MIService.Current.executeRequest(myRequest).then(function(response) {
			saved = true;
			_this.log.Info("RECORD SAVE SUCESS "   ); 
			_this.prtAddrLabel(parseInt(dlix), panr, _this.copy);
		})["catch"](function(response) {
			if(saved == false){
				_this.log.Info(" RECORD SAVE -----------fail-------->"  + saved + "  "+ response.errorMessage); 
			_this.addRecord( parseInt(dlix), panr);
			}else{
				_this.log.Info("  -----------failed----because---->" +  response.errorMessage); 
			}
			 
		});
		 
	};
	this.showDialog = function(popn, cuor, itno, dlix) {
		// Use self to get correct reference to the class in the button
		// handlers.
		var self = this;	
		var copy = 1;
				 
				//_this.log.Info(" _this.popn " + self.popn );   
			//	_this.log.Info(" popn " +popn );   
		// Create the dialog content
		var dialogContent = $("<div> " +
		"<form >"+
		" Customer PO		:<br /> <input type='text' id='cuor' name='cuor' style='text-align: left' value='"+ cuor+"'  maxlength='30' size='15' > <br /> "+
		"Customer item# :<br /> <input type='text' id='popn' name='popn' style='text-align: left' value='"+ popn +"'  maxlength='30' size='30' > <br />"+
		 "Number of labels	:<br /> <input type='text' id='copy' name='numLabels' style='text-align: right' onkeypress='return event.charCode >= 48 && event.charCode <= 57' value="+ copy +"  maxlength='3' size='2' >" +		 
	   "</form>"+		
		 " </div>");		
        var dialogButtons = [
            {
                text : "Print  Address Label",
                isDefault: false,
				width: 100,				
                click: function () {
					self.log.Info("Button clicked   ");					
				  self.callMWS423MI(parseInt(dlix));
				  self.isDialogShown = true;
					self.pressEnterAsync();
                   $(this).inforDialog("close");
                    self.isDialogShown = true;
					self.pressEnterAsync();
					 
				    
					 
                }
            },
            {
				text: "Cancel",
				isDefault: true,
                width: 80,
                click: function () {
                    $(this).inforDialog("close");
                }
            }
        ];
		var dialogOptions = {
			title :" Delivery: " + parseInt(dlix) + " Item: "+itno ,
			dialogType : "General",
			//modal : true,
			width: 300,
			minHeight : 100,
			icon : "info",
			closeOnEscape : true,
		// option: "resizable",
			close : function() {
				dialogContent.remove();
			},
			buttons : dialogButtons
		};
		// Show the dialog
		dialogContent.inforMessageDialog(dialogOptions);
		 
	};

	return MWS411_B_PrintAddressLabel;
}();