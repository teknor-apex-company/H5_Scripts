var SetFieldValue = new function(){
	this.Init = function(scriptArgs){
		var renderEngine = scriptArgs.controller.RenderEngine,
			content = renderEngine.Content,
			myButton = this.CreateButtonElement(content, {
				name: "myButton1",
				value: "Set field value",
				top: 2,
				left: 1
			}),
			myLabel1 = this.CreateLabelElement(content, {
				name: "myLabel1",
				value: "Field",
				top: 1,
				left: 1
			});
			myTextbox1 = this.CreateTextBoxElement(content, {
				name: "myTextbox1",
				value: "",
				top: 1,
				left: 4,
				width: 5,
				height: 1,
				isUpper: true
			}),
			myLabel2 = this.CreateLabelElement(content, {
				name: "myLabel2",
				value: "Value",
				top: 1,
				left: 10
			}),
			myTextbox2 = this.CreateTextBoxElement(content, {
				name: "myTextbox2",
				value: "",
				top: 1,
				left: 13,
				width: 5,
				height: 1,
				isUpper: true
			});
		
		// Bind a click event on button element
		if(myButton != null){
			eventParam = {
				textBox1: myTextbox1,
				textBox2: myTextbox2
			};
			ScriptUtil.AddEventHandler(myButton, "click", function(event){
				var myTextbox1 = event.paramData["textBox1"],
					myTextbox2 = event.paramData["textBox2"],
					field = ScriptUtil.GetFieldValue(myTextbox1.attr("id")).toUpperCase(),
					value = ScriptUtil.GetFieldValue(myTextbox2.attr("id"));
					
					ScriptUtil.SetFieldValue(field, value);
			}, eventParam);
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