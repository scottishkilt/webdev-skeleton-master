
var width = 1000,
    height = 500
	
var color = d3.scale.category20();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
	

$(function(){

    var currentValue = $('#currentValue');

    $('#alphaSlider').change(function(){
        currentValue.html(this.value);
		var alpha = $(this).val();
		_.debounce(drawGraph(alpha), 5000);
    });

    // Trigger the event on load, so
    // the value field is populated:

    $('#alphaSlider').change();

});

var drawGraph= function (alpha){
var force = d3.layout.force()
    .gravity(.05)
    .distance(100)
    .charge(-100)
    .size([width, height]);
	
var filePath = "cooccurrence_lol.json";
d3.json( filePath, function( data) {
  var cooc = data.matrix;
  var backBoned = [];
  for(var i =cooc.length-1; i>=0; i--){
	backBoned[i]=[];
	var k_n=cooc[i].length;
	if(k_n >1){
		var sum_w =0;
		for(var j=cooc[i].length-1; j>=0; j--){
			sum_w+=cooc[i][j];
		}
		for(var j=cooc[i].length-1; j>=0; j--){
			var edgeWeight=cooc[i][j];
			var pij= edgeWeight/sum_w;
			if( Math.pow((1-pij),(k_n-1)) < alpha){
				backBoned[i][j]=edgeWeight;
			}
			else{
				backBoned[i][j]=0;
			}
		}
	}
  }
	 
	 var nodes=[], links=[];
	 for(var i = data.labels.length-1; i>=0; i--){
		nodes.push({name: data.labels[i], group: Math.floor(Math.random()*10), size: Math.random()*10+1});
	 }
	 for(var i = 0; i<backBoned.length; i++){
		for(var j =0; j<i; j++){
			if(backBoned[i][j]>0){
				links.push({source: i,target:j,value: backBoned[i][j]});
				}
			}
		}
		var json={nodes: nodes,
				  links: links
				  };
//});



	
//"cooccurrence_sexual_activity_backbone_d3.json"
//d3.json("cooccurrence_sexual_activity_backbone_d3.json", function(error, json) {

  force
      force.nodes(json.nodes)
      .links(json.links)
      .start();

  var link = svg.selectAll(".link")
      .data(json.links)
    .enter().append("line")
      .attr("class", "link");


var node = svg.selectAll(".node")
    .data(json.nodes)
  .enter().append("g")
    .attr("class", "node")
	.attr("r", 10)
	.style("fill", function(d) { return color(d.group); })
    .call(force.drag);

node.append("circle")
    .attr("r", function(d){ return Math.log(d.size);})
	.style("fill", function(d) { return color(d.group); });

node.append("text")
    .attr("dx", function(d){ return Math.log(d.size);})
    .attr("dy", ".45em")
    .text(function(d) { return d.name })
	.style("font-size",function(d){  return Math.log(d.size)*4;});

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
});
};