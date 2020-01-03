var ButtonTester = new function(){
	this.Init = function(scriptArgs){
		//scriptArgs contains 4 data such as the ff:
		//console.log("elem: " + scriptArgs.elem + "\tcont: " + scriptArgs.controller 
		//		+ "\targs: " + scriptArgs.args + "\tdebug: " + scriptArgs.debug);
		var $host = scriptArgs.controller.ParentWindow;
		var $cont = scriptArgs.controller;
		var $args = scriptArgs.args;
		var $el = scriptArgs.elem;
		var $debug = scriptArgs.debug;
		
		var btnElem = new ButtonElement();
		btnElem.Value = "SampleBTN";
		var pos = new PositionElement();
		//pos.Width = 10;
		pos.Top = 9;
		pos.Left = 20;
		
		btnElem.Position = pos;
		
		var btn = ControlFactory.CreateButton(btnElem);
		btn.attr("id", "sampleBtn_id");
		//positioning should always be set in the client script; and append to add to main UI
		//btn.css({"position":"absolute", "left":"224px", "top":"184px", "z-index":"9000"});
		
		var btn = $('<button class="inforFormButton"></button>') 
		btn.text("SampleBTN");
		btn.css({"width":"auto", "position":"absolute", "left":"205px"});
		//var $container = $("<div class='elementContainer' style='position:absolute;left:"+ (btnElem.Position.Left * 12) +"px' />");
		//$container.append(btn);
		btn.css({"position":"absolute", "left":"205px"}); //"width":"auto",
		$host.find("#pRow9").append(btn);
		var content = $cont.RenderEngine.Content;
		btn.click(function(e){
			$debug.Clear();
			$debug.WriteLine("click button");
			//$cont.RenderEngine.ShowMessage("This is a sample Message for the Script");
			
			var btn1_Elem = new ButtonElement();
			btn1_Elem.Value = "Test Button";		
			
			var btn1 = ControlFactory.CreateButton(btn1_Elem);
			btn1.attr("id", "testBtn_id");
			
			var pos = new PositionElement();
			pos.Width = "auto";
			pos.Top = "20";
			pos.Left = "300";
			btn1.Position = pos;
			
			content.Add(btn1);
			btn1.click(function(){
				//$cont.RenderEngine.ShowMessage("Testing the attached button");
				//$debug.WriteLine($cont.toString);
				var headerMsg = "HEADER";
				var msg = "the quick brown fox jumps over the lazy dog";
				var opts = {
						dialogType: "Question", //"Question", "Information", "Warning", "Error", "Success",	
						header: headerMsg,
						message: msg,
						id: "testScript",
						withCancelButton: true,
						isCancelDefault: true
				}
				ConfirmDialog.ShowMessageDialog(opts);
			});
			
			//===============TEST FRAMEWORK======================
			//ConfirmDialog - OK
			//Implementation for new ConfirmDialog 
			/*var headerMsg = "HEADER";
			var msg = "the quick brown fox jumps over the lazy dog";
			var opts = {
					dialogType: "Question", //"Question", "Information", "Warning", "Error", "Success",	
					header: headerMsg,
					message: msg,
					id: "testScript",
					withCancelButton: true,
					isCancelDefault: true
			}
			ConfirmDialog.ShowMessageDialog(opts);*/
			
			//$debug.Clear();
			//$debug.ToString();
			//var util = new ScriptUtil();
			
			//var hiddenField = ScriptUtil.FindChild(content, $args);
			//$debug.WriteLine(hiddenField.val()); //->working equivalent of hiddenField.Text
			//console.log($("body").find("#W1OBKV").val());
			
			//ScriptUtil - OK
			//ScriptUtil.Launch("OIS100");
			//ScriptUtil.Launch("mforms://MMS100");
			//ScriptUtil.Launch("http://www.infor.com");
			//ScriptUtil.Launch("net extension manager");
			
			//ListControl
			/*var $list = ListControl.ListView();		
			var $headers = ListControl.Headers();
			for(var i=0; i<$headers.length;i++){
				console.log($headers[i]);
			}
			ListControl.Columns();
			var $columns = ListControl.Columns();
			for(var i=0; i<$columns.length;i++){
				console.log($columns[i]);
			}
			
			//$debug.WriteLine($list.getColumns());
			
			//SessionCache - OK
			SessionCache.Add("001", "123");
			SessionCache.Add("002", "abcdef");
			SessionCache.Add("003", "sample script");
			var oBtn = new ButtonElement;
			SessionCache.Add("004", oBtn);
			$debug.WriteLine(SessionCache.SessionMap);
			
			var isRemoved = SessionCache.Remove("003");
			//console.log("\t ### " + isRemoved);
			var isKeyExisting = SessionCache.ContainsKey("005");
			$debug.WriteLine("Is Key '003' removed from the map? " + isRemoved 
					+ "\n" + "Is Key '005' existing in the map? " + isKeyExisting);
			
			//InstanceCache - OK
			//$debug.WriteLine("IID: "+$cont.IID);
			InstanceCache.Add($cont, "010", "987");
			InstanceCache.Add($cont, "011", "zyxwvu");
			InstanceCache.Add($cont, "012", "testing script");
			var oLbl = new LabelElement;
			InstanceCache.Add($cont, "013", oLbl);
			$debug.WriteLine(InstanceCache.InstanceMap);
			
			var isRemoved = InstanceCache.Remove($cont, "012");
			//console.log("\t ### " + isRemoved);
			var isKeyExisting = InstanceCache.ContainsKey($cont, "015");
			$debug.WriteLine("Is Key '003' removed from the map? " + isRemoved 
					+ "\n" + "Is Key '005' existing in the map? " + isKeyExisting);*/
		});
	}
}	