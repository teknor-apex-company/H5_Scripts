var UnloadEvent = new function(){
	this.Init = function(scriptArgs){
		var renderEngine = scriptArgs.controller.RenderEngine,
			content = renderEngine.Content;
		
		ScriptUtil.AddEventHandler($(window), "click.myWindow", function(event){
			//there should always be one click event handler with namespace "myWindow"
			ScriptDebugConsole.WriteLine(jQuery._data(window, "events")["click"]);
		});

		content.OnUnload(this.Unload);
	};
	
	this.Unload = function(){
		ScriptUtil.RemoveEventHandler($(window), "click.myWindow");
	};
}