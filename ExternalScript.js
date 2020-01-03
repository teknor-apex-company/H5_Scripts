var ExternalScript = new function(){
	this.Init = function(scriptArgs){
		ScriptUtil.LoadScript("scripts/Adder.js", ExternalScript.AdderCallback);
		
		ScriptUtil.LoadScript("scripts/ListControlSamples.js", function(data){
			ListControlSamples.Init(scriptArgs);
		});
	}
	
	this.AdderCallback = function(data){
		ScriptDebugConsole.WriteLine(data);
		ScriptDebugConsole.WriteLine(Adder);
		ScriptDebugConsole.WriteLine(Adder.AddItems(1, 2));
	};
}