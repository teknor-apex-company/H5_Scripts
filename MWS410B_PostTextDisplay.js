var MWS410B_PostTextDisplay = new function() {
	this.Init = function(scriptArgs) {
		this.controller = scriptArgs.controller;
		this.log = scriptArgs.log;
		this.args = scriptArgs.args;
		this.contentElement = this.controller.GetContentElement();
		var apiResponse = [];
		var dlixNo = "";
		this.addM3APIDialogButton();
	};
	this.addM3APIDialogButton = function() {
		var _this = this;
		var buttonElement = new ButtonElement();
		buttonElement.Name = "postTextButton";
		buttonElement.Value = "Get Post Text";
		buttonElement.Position = new PositionElement();
		buttonElement.Position.Top = 7;
		buttonElement.Position.Left = 14;
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
							_this.log.Info("ridnIndex " + ridnIndex);
							// check if column was found
							if (parseInt(ridnIndex) < 0) {
								_this.log.Info("Column not found");
							} else {
								var dlix = ListControl.ListView
								.GetValueByColumnIndex(dlixIndex);
								_this.dlixNo = dlix;
								var ridn = ListControl.ListView
										.GetValueByColumnIndex(ridnIndex);
										
								_this.log.Info("ridn " + ridn);
								if (ridn === "" || ridn == "") {
									_this.controller
											.ShowMessage("The order number can not be found, ");
								} else {
									_this.callOIS100MI(ridn);
								}
							}
						});
	};
	this.callOIS100MI = function(ridn) {
		var _this = this;
		var potx = 0;
		// API Call time with value entered
		var myRequest = new MIRequest();
		myRequest.program = "OIS100MI";
		myRequest.transaction = "GetHead";
		// output
		myRequest.outputFields = [ "POTX" ];
		// input
		myRequest.record = {
			ORNO : ridn
		};
		// Calling API
		MIService.Current
				.executeRequest(myRequest)
				.then(
						function(response) {
							// Read results here
							for (var _i = 0, _a = response.items; _i < _a.length; _i++) {
								// Get individual item from ItemsList
								var item = _a[_i];
								// get textID
								potx = parseInt(item.POTX);
							}
							_this.log.Info(" potx : " + potx);
							if (potx < 1) {
								_this.controller
										.ShowMessage("No Text was found for this Order Number");
							} else {
								// getText
								_this.callCRS980MI(potx);
							}
						})["catch"](function(response) {
			// Handle errors here
			_this.log.Error(response.errorMessage);
			_this.controller.ShowMessage(response.errorMessage);
		});
		// end call
	}
	this.callCRS980MI = function(txid) {
		var _this = this;
		// Object to store response
		var returnedLines = [];
		// API Parameters
		var txvr = "CO02";
		var tfil = "OSYTXH";
		// Init API Call
		var myRequest = new MIRequest();
		myRequest.program = "CRS980MI";
		myRequest.transaction = "SltTxtBlock";
		// output
		myRequest.outputFields = [ "TX60", "LINO" ];
		// input
		myRequest.record = {
			TXID : txid,
			TXVR : txvr,
			TFIL : tfil
		};
		// Calling API
		MIService.Current.executeRequest(myRequest).then(function(response) {
			// Read results here
			//myCount = 0;
			for (var _i = 0, _a = response.items; _i < _a.length; _i++) {
				// Get individual LINES
                var item = _a[_i];                
				    returnedLines.push(item.TX60);    
			}
			_this.log.Info(" returnedLines : " + returnedLines);
			setTimeout(function() {
				_this.showDialog(returnedLines);
			}, 0);
		})["catch"](function(response) {
			// Handle errors here
			_this.controller.ShowMessage(response.errorMessage);
		});
		// end call
	}
	this.showDialog = function(linesToDisplay) {
		// Use self to get correct reference to the class in the button
		// handlers.
		var self = this;
		var lineAmount = linesToDisplay.length;
		// building list via HTML
		var text = "<ul>";
		for (i = 0; i < lineAmount; i++) {
			text += "<li>" + linesToDisplay[i] + "</li>";
		}
		text += "</ul>";
		// Create the dialog content
		var dialogContent = $("<div> " + text + " </div>");
		var dialogButtons = [ {
			text : "OK",
			isDefault : true,
			width : 80,
			click : function() {
				$(this).inforDialog("close");
				self.isDialogShown = true;
			}
		},

		];
		var dialogOptions = {
			title : "Post text for Dely no " + self.dlixNo ,
			dialogType : "General",
			modal : true,
			minWidth : 100,
			maxWidth : 200,
			minHeight : 100,
			maxHeight : 200,
			icon : "info",
			closeOnEscape : true,
		//	 option: "resizable",
			close : function() {
				dialogContent.remove();
			},
			buttons : dialogButtons
		};
		// Show the dialog
		dialogContent.inforMessageDialog(dialogOptions);
	};

	return MWS410B_PostTextDisplay;
}();