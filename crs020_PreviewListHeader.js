var crs020_PreviewListHeader = new function(){
	this.Init = function(scriptArgs){
		var controller = scriptArgs.controller;
		var content = controller.RenderEngine.Content; 
		
		var WWSFLL = this.FindElement(content, "WWSFLL");
		var WWSFHL = this.FindElement(content, "WWSFHL");
		
		var tmpStr = WWSFHL.Value.split(' ');
		var colVal = "", ctr = 0;
		var ListElem = new ListElement();
		ListElem.Position = new PositionElement();
		ListElem.Position.Width = 100;
		ListElem.Position.Height = 50;
		
		for(var i=0; i<tmpStr.length;i++ ){
			if(tmpStr[i] != ""){
				var cols = {};
				if(/^[A-Z]/.test(tmpStr[i]) == true){
					colVal = tmpStr[i] + " ";
					ctr += 1; 
					cols = {
							id:  "C"+ctr,
							name: colVal,
							field: colVal								
					};
					ListElem.Columns.push(cols);
				}else{ 
					colVal += tmpStr[i] + " ";
					cols = {
							id:  "C"+ctr,
							name: colVal,
							field: colVal						
					};
					ListElem.Columns.splice(ListElem.Columns.length-1, 1, cols);					
				}
			}			
		}
		
		rows = WWSFLL.Value.split(' ');
		var rowItem = [];
		for(var j=0; j<rows.length; j++){
			if(rows[j].trim() != ""){
				rowItem.push(rows[j]);
			}
		}
		
		var data = [];
		var row = {};
		row["id"] = "R1";
		
		for(var j=0; j<ListElem.Columns.length; j++){
			row[ListElem.Columns[j]["field"]] = rowItem[j];
		}
		data[0] = row;
		
		var id = "crs020FGrid";
		var $list = $("<div>",{
			"class":"inforDataGrid",
			"id": id,
			"width": "auto",
			"height": "500px"			
		});
		$list.Position = new PositionElement();
		$list.Position.Width = "100%";
		$list.Position.Top = "250";
		$list.Position.Left = "0";
		
		content.Add($list);

		var jqueryListId = "#" + id;
		var options = Configuration.Current.ListConfig('id', ListElem.Columns, data);
		options["forceFitColumns"] = true;
		options["autoHeight"] = true;
		
		var grid = $(jqueryListId).inforDataGrid(options);
		//grid.setSelectedRows([0]);
		grid.render();
		
	}
	
	this.FindElement = function(content, element){
		for(var i=0; i<content.Children.length; i++) {
			if(content.Children[i].Name == element) {
				return content.Children[i]; 
			}
	    }
	    return null;
	}
}