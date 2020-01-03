class TestButton {
	public static Init(args: IScriptArgs): void {
		const buttonElement = new ButtonElement();
		buttonElement.Name = "btnFoo"; 
		buttonElement.Value = "Foo";
		buttonElement.Position = new PositionElement(); 
		buttonElement.Position.Top = 3; 
		buttonElement.Position.Left = 1; 
		buttonElement.Position.Width = 5;
		const contentElement = args.controller.GetContentElement();
		const button = contentElement.AddElement(buttonElement);
		button.click({}, () => { args.log.Info("Foo was clicked.");
		});
	}
}