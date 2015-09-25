var modelo = {
    totales:[],
    status:0,
    datos:[]
};

function table_clear(){
	$("#elections tbody").remove();
	
};

function bindDelete() {
	$("#deleteBtn").click(table_clear);
};

function bindPolling() {
	$("#pollBtn").click(startPolling);
};

function getJson(url){
var json="";

	$.ajax({

                
                url:   url,
				dataType:"json",
				async: false,
				cache: false,
				error: function(request, status,error){
					json= request.responseText+status+error;
				
				}

        })
        .done(function(data){

	         json=data;
	         
        });

        
        return json;

}

function requestVotesFromServer(e){	  
	 var req = getJson('/votes');
	 console.log('serverRequest after');
	 console.log('request'+req);
	 return Q(req); // CONVIERTE LA PROMESA DE JQUERY A Q

	};
 function updateModel(votes){
	
	var d = Q.defer();
	var votes = $.map(votes.votes, function(index){return index});
	console.log('status'+modelo.status);
	if(modelo.status==0){
		$.each(votes, function(index) {
		modelo.totales.push(votes[index].voters);
	});
		modelo.status=1;
		var x;

	}
	var x;
	modelo.datos= votes;
	d.resolve(modelo);
	return d.promise;
 }



function updateTable(modelo){
	var mitabla= $("#elections");
	table_clear();
		var datas = modelo.datos;
		var totales = 0;
		$.each(datas, function(index) {  
        var $linea = $('<tr></tr>');
        $linea.append( $('<td></td>').html(datas[index].nombre));
        $.each(datas[index].parties,function(index2,data){
        	$linea.append( $('<td></td>').html(data)); 
        	$linea.append( $('<td></td>').html(((data*100)/modelo.totales[index]).toFixed(4)));	
        	totales += data;
        });
        $linea.append( $('<td></td>').html(totales));
        $linea.append( $('<td></td>').html(((totales*100)/modelo.totales[index]).toFixed(2)));
        $linea.append( $('<progress class="prog" value="'+totales+'" max="'+modelo.totales[index]+'"></progress>'));
        mitabla.append($linea);
        totales=0;
    });	
};
var timer;
function startPolling(e){

 timer = setInterval(function(){votesWorkFlow();}, 5000);
 	
};



function votesWorkFlow(e){
		
	  Q().then(disableControls)
	     .then(requestVotesFromServer)
	     .fail(handleServerError)
	     .then(updateModel)
		 .then(updateTable)
		 .fail(handleTableError)
		 //.then(updateCharts)
		 .then(enableControls)
		 .done();
  
};
function disableControls(){
	 console.log('Disable controls');
	$("#pollBtn").attr('disabled', 'disabled');
}
function enableControls(){
	console.log('Enable controls');
	$("#pollBtn").removeAttr('disabled');
}

function handleServerError(e){
	console.log(e.toString());
}

function handleTableError(e){
	console.log(e.toString());
}
var times = 0;
function obtainNewVotesCalculations(votes){
	 console.log('Obtaining calculations');
	 var live = 0;
     for(var place in votes){
		 var prov = votes[place];
		 if (prov.voters == 0) continue;
		 live++;
		 for(var p in prov.parties){
			 var prob = Math.random();
			 var v = Math.round(prov.voters*prob);
			 if (v > prov.voters) v = prov.voters;
			 prov.parties[p] += v;
			 prov.voters -= v;
			 if (prov.voters < 0) prove.voters = 0;
		 }	 
	 };
	 if(live == 0){
		 console.log('Elections is finished')
		 clearInterval(timer);
	 };
	 return votes;
};
