var UserDetailsM3APICall = new function(){
	this.Init = function(scriptArgs){
		var controller = scriptArgs.controller,
			args = scriptArgs.args,
			element = scriptArgs.elem,
			debug = scriptArgs.debug;
		
		var content = controller.RenderEngine.Content,
			myButton = this.CreateButtonElement(content, {
			name: "myButton1",
			value: "Show user details",
			top: 1,
			left: 1
		});
		
		// Bind a click event on button element
		if(myButton != null){
			ScriptUtil.AddEventHandler(myButton, "click", function(event){
				var userId = ScriptUtil.GetUserContext("USID"),
					url = "/execute/MNS150MI/GetUserData?USID=" + userId;
				
				ScriptUtil.ApiRequest(url, UserDetailsM3APICall.onSuccess, UserDetailsM3APICall.onFail);
			});
		}
	};
	
	this.CreateButtonElement = function(content, buttonData){
		var buttonElement = new ButtonElement();
			
		buttonElement.Name = buttonData.name;
		buttonElement.Value = buttonData.value;
		buttonElement.Position = new PositionElement();
		buttonElement.Position.Top = buttonData.top;
		buttonElement.Position.Left = buttonData.left;
		
		return content.AddElement(buttonElement);
	};
	
	this.onSuccess = function(result){
		ScriptDebugConsole.WriteLine(result);
	};
	
	this.onFail = function(e, msg){
		ScriptDebugConsole.WriteLine("error calling api: ", e, msg);
	};
}