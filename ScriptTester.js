var ScriptTester = new function(){
	var message;
	this.Init = function(scriptArgs){
		var debug = scriptArgs.debug;
		var element = scriptArgs.elem;
		var args = scriptArgs.args;
		
		debug.WriteLine("Script Initializing...");
		
		if(element != null){
			debug.WriteLine("Connected element" + element.Name);
		}
		
		message = "";
		
		if (element) {
			message = message + "Connected element: " + element.Name + "\n";
		} else {
			message = message + "No element connected.\n";
		}
		
		if (args != null) {
			message = message + "Arguments: " + args;
		}
		
		this.ShowMessage(message);
	}
	
	this.ShowMessage = function(message) {
		ConfirmDialog.ShowMessageDialog({
			dialogType: "Information",
			header : "Script Tester",
			message: message			
		});
	}
}