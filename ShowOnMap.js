var ShowOnMap = new function(){
	this.Init = function(scriptArgs){
		var controller =  scriptArgs.controller;
		var content = controller.RenderEngine.Content;
		var me = this;		
				
		var showMapBtn_elem = new ButtonElement();
		showMapBtn_elem.Value = "Show Map";		
		
		var showMapBtn = ControlFactory.CreateButton(showMapBtn_elem);
		showMapBtn.attr("id", "showMapBtn");
		
		var pos = new PositionElement();
		pos.Width = "auto";
		pos.Top = "517";
		pos.Left = "350";
		showMapBtn.Position = pos;
		
		content.Add(showMapBtn);
		showMapBtn.on("click", me.OnClickShowMap);
	}
	
	this.OnClickShowMap = function(e){
		var $host = $(".visible-tab-host");		
		var lat = ScriptUtil.FindChild($host, "WFGEOX");
		var lng = ScriptUtil.FindChild($host, "WFGEOY");
		var zoom = ScriptUtil.FindChild($host, "WFGEOZ");
		
		var x=0, y=0, z=0, loc = "", url = "";
		if(lat && lng){
			x = lat.val();
			y = lng.val();
			z = zoom.val();
			
			if(x.indexOf("-") > -1){
				x = x.replace("-", "");
				x = "-" + x;
			}
			
			if(y.indexOf("-") > -1){
				y = y.replace("-", "");
				y = "-" + y;
			}
			
			loc = x + "+" + y;
			if(z != ""){
				url = "https://maps.google.com/maps?z="+ z +"&t=m&q=loc:" + loc + "&output=embed";
			}else{
				url = "https://maps.google.com/maps?z=15&t=m&q=loc:" + loc + "&output=embed";
			}
		}
		
		ScriptUtil.Launch(url);
	}
}