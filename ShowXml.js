var ShowXml = new function(){
	this.CHAR_MAP = {
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;',
		'"': '&quot;',
		"'": '&#39;',
		'!': '&#33;',
		'[': '&#91;',
		']': '&#93;'
	};

	this.Init = function(scriptArgs){
		var controller =  scriptArgs.controller;
		var _xml = controller.Response.RawContent;
		var me = this;
		
		var strXml = (new XMLSerializer()).serializeToString(_xml);
		
		var finalStr = me.EscapeChar(strXml);
		ConfirmDialog.ShowMessageDialog({
			dialogType: "Information",
			header : "XML Response",
			message: finalStr
		});
	}
	
	this.EscapeChar = function(str){
		var me = this;
		return str.replace(/[<>&"'!]/g, function (ch) {
			return me.CHAR_MAP[ch];
		});
	}
}