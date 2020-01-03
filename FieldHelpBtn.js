var FieldHelpBtn = new function(){
	this.Init= function(scriptArgs){
		var element = scriptArgs.elem;
		var controller = scriptArgs.controller;
		var fieldhelp = scriptArgs.args;
		var response = controller.Response;
		var $host = $(".lawsonHost:visible");
		
		var $elem = ScriptUtil.FindChild($host, element.Name);
		$elem.click({_response:response, _controller:controller, _$host:$host, _fieldhelp:fieldhelp}, function(e){
			var _cont = e.data._controller, _resp = e.data._response, 
			_$host = e.data._$host, _hlp = e.data._fieldhelp;
			
			_cont.RenderEngine.OpenFieldHelp(_resp, _$host, _cont, _hlp);	
		});
	}
}