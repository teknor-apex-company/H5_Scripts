var SetApplicationFieldsListener = new function(){
	this.Init = function(scriptArgs){
		infor.companyon.client.unRegisterMessageHandler("setApplicationFields");
		infor.companyon.client.registerMessageHandler("setApplicationFields", this.handleSetApplicationFields);
	}
	
	this.handleSetApplicationFields = function(msg){
		var fields = msg.fields;
		
		for(var i=0; i<fields.length; i++){
			ScriptUtil.SetFieldValue(fields[i].key, fields[i].val);
		}
	}

	/**
	 * To be removed. for testing only.
	 * 
	 * Usage: Ming.Le in Chrome
	 * Open developer tools and go to console tab.
	 * Make sure that the frame is in m3h5(index.jsp)
	 * Execute SetApplicationFieldsListener.test()
	 */
	this.test = function(){
		var data = {
				fields: [
				         { key: "RESP", val: "rest test" },
				         { key: "FUDX", val: "fudx test" },
				         { key: "WAPROJ", val: "waproj test" },
				         { key: "WWSELE", val: "2" }
				         ]
		};
		infor.companyon.client.sendMessage("setApplicationFields", data);
	}
}