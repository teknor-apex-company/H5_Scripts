var OpenMenu = new function(){
	this.Init = function(scriptArgs){
		var renderEngine = scriptArgs.controller.RenderEngine,
			content = renderEngine.Content,
			myButton = this.CreateButtonElement(content, {
				name: "myButton1",
				value: "Open menu",
				top: 4,
				left: 80
			}),
			myLabel1 = this.CreateLabelElement(content, {
				name: "myLabel1",
				value: "Menu name",
				top: 3,
				left: 80
			}),
			myTextbox1 = this.CreateTextBoxElement(content, {
				name: "myTextbox1",
				value: "",
				top: 3,
				left: 90,
				width: 5,
				height: 1
			});
		
		// Bind a click event on button element
		if(myButton != null){
			eventParam = {
				textBox: myTextbox1
			};
			ScriptUtil.AddEventHandler(myButton, "click", function(event, cont){
				var myTextbox1 = event.paramData["textBox"],
					menuName = ScriptUtil.GetFieldValue(myTextbox1.attr("id"));
					
					ScriptUtil.OpenMenu(menuName, cont);
			}, eventParam, scriptArgs.controller);
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
	
	this.CreateTextBoxElement = function(content, textboxData){
		var textboxElement = new TextBoxElement();
			
		textboxElement.Name = textboxData.name;
		textboxElement.Value = textboxData.value;
		
		textboxElement.Position = new PositionElement();
		textboxElement.Position.setValues(textboxData.top, textboxData.left, textboxData.width, textboxData.height); //params: Top, Left, Width, Height
		
		textboxElement.Constraint = new ConstraintElement();
		textboxElement.Constraint.IsUpper = textboxData.isUpper;
		return content.AddElement(textboxElement);
	};
	
	this.CreateLabelElement = function(content, labelData){
		var labelElement = new LabelElement();
		
		labelElement.Name = labelData.name;
		labelElement.Value = labelData.value;
		
		labelElement.Position = new PositionElement();
		labelElement.Position.setValues(labelData.top, labelData.left, labelData.width, labelData.height);
		
		labelElement.Constraint = new ConstraintElement();
		labelElement.Constraint.IsColon = labelData.isColon;
		return content.AddElement(labelElement);
	};
}