var ListControlSamples = new function(){
	this.Init = function(scriptArgs){
		var renderEngine = scriptArgs.controller.RenderEngine,
			content = renderEngine.Content,
			myButton = this.CreateButtonElement(content),
			myComboBox = this.CreateComboBoxElement(content),
			myTextbox = this.CreateTextBoxElement(content);
		
		// Bind a click event on button element
		if(myButton != null){
			eventParam = {
				comboBox: myComboBox,
				textBox: myTextbox
			};
			ScriptUtil.AddEventHandler(myButton, "click", function(event){
				var myComboBox = event.paramData["comboBox"],
					myTextbox = event.paramData["textBox"],
					comboBoxValue = ScriptUtil.GetFieldValue(myComboBox.attr("id")),
					textFieldValue = ScriptUtil.GetFieldValue(myTextbox.attr("id")),
					result;
				
				switch(comboBoxValue){
					case "1": result = ListControl.Columns();
							break;
					case "2": result = ListControl.Headers();
							break;
					case "3": result = ListControl.GetColumnIndexByName(textFieldValue.toUpperCase());
							break;
					case "4": result = ListControl.ListView.SelectedItem();
							break;
					case "5": result = ListControl.ListView.GetValueByColumnIndex(parseInt(textFieldValue, 10));
							break;
					case "6": result = ListControl.ListView.GetValueByColumnName(textFieldValue.toUpperCase());
							break;
				}
				
				ScriptDebugConsole.WriteLine(result);
			}, eventParam);
		}
	};
	
	this.CreateButtonElement = function(content){
		var buttonElement = new ButtonElement();
			
		buttonElement.Name = "myButton";
		buttonElement.Value = "Execute choice";
		buttonElement.Position = new PositionElement();
		buttonElement.Position.Top = 2;
		buttonElement.Position.Left = 1;
		
		return content.AddElement(buttonElement);
	};
	
	this.CreateComboBoxElement = function(content){
		var comboBoxElement = new ComboBoxElement(),
			comboBoxItems = [],
			cBoxItemElement,
			myCbox;
			
		comboBoxElement.Name = "myComboBox";
		comboBoxElement.Value = 1;
		comboBoxElement.Position = new PositionElement();
		comboBoxElement.Position.setValues(1, 1, 20, 1); //params: Top, Left, Width, Height
		
		cBoxItemElement = new ComboBoxItemElement();
		cBoxItemElement.Value = "1";
		cBoxItemElement.Text = "Get columns";
		cBoxItemElement.IsSelected = true;
		comboBoxItems.push(cBoxItemElement);
		
		comboBoxElement.Items = comboBoxItems;
		myCbox = content.AddElement(comboBoxElement);
		
		content.ComboBox.AddItem(comboBoxElement.Name, "2", "Get header");
		content.ComboBox.AddItem(comboBoxElement.Name, "3", "Get column index by name");
		content.ComboBox.AddItem(comboBoxElement.Name, "4", "Get selected rows", true);
		content.ComboBox.AddItem(comboBoxElement.Name, "5", "Get value by column index");
		content.ComboBox.AddItem(comboBoxElement.Name, "6", "Get value by column name");
		
		return myCbox;
	};
	
	this.CreateTextBoxElement = function(content){
		var textboxElement = new TextBoxElement();
			
		textboxElement.Name = "myTextbox";
		textboxElement.Value = "";
		textboxElement.Position = new PositionElement();
		textboxElement.Position.setValues(1, 21, 5, 1); //params: Top, Left, Width, Height
		textboxElement.Constraint = new ConstraintElement();
		textboxElement.Constraint.IsUpper = true;
		return content.AddElement(textboxElement);
	};
}