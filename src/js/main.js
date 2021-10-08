exports.classification = function() {
  var gColorMap = {};
  var gEleId = null;
  var gCategoryName = null;
  var gHeight = null;
  var gWidth = null;
  var gSelectedDataSet = null;

  let publicScope = {};
  publicScope.init = function(eleId, options) {
    if (!isValidOptions(options)) {
      return;
    }

    var extend = function(a, b){
      for (var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key];
        }
      }
      return a;
    }

    options = extend({
      colorMap: {},
      height: 640,
      width: 690,
      selectedDataSet: null, 
      selectedColumns: null, 
      categoryName: null,
    }, options);

    gEleId = eleId;
    gCategoryName = options.categoryName;
    gColorMap = options.colorMap;
    gHeight = options.height;
    gWidth = options.width;
    gSelectedDataSet = options.selectedDataSet; 
    gSelectedColumns = options.selectedColumns;
    
    initInternal();
  }

  function isValidOptions(options) {
    if (options.selectedDataSet == null || options.selectedDataSet.length <= 0) {
      return false;
    }

    if (options.selectedColumns == null || options.selectedColumns.length < 2) {
      return false;
    }

    return true;
  }

  function initInternal() {
    d3.select(`div#${gEleId} > *`).remove();
    var svg = d3.select(`div#${gEleId}`)
      .append("svg")
      .attr("height", gHeight)
      .attr("width", gWidth)
      .append("g")
      .attr("transform", "translate(0,0)");

    var radiusScale = d3.scaleSqrt().domain([1, 250000]).range([10, 100]);
    
    var forceXSplit = d3.forceX(function(d) {
      if (d[gCategoryName] === "China" || d[gCategoryName] === "US") {
        return (gWidth * .30);
      } else {
        return (gWidth * .70);
      }
    }).strength(0.15);

    var forceXCombine = d3.forceX((gWidth)/2).strength(0.1);

    var forceCollide = d3.forceCollide(function(d) {
      return radiusScale(d.revenue) + 1;
    })

    var simulation = d3.forceSimulation()
      .force("x", forceXCombine)
      .force("y", d3.forceY(gHeight / 2).strength(0.09))
      .force("collide", forceCollide)  

    d3.select('div#classification-tooltip').remove();
    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "classification-tooltip")
      .style("position", "absolute")
      .style("z-index", "20")
      .style("visibility", "hidden")
      .style("color", "white")
      .style("padding", "8px")
      .style("background-color", "rgba(0, 0, 0, 0.75)")
      .style("border-radius", "6px")
      .style("font", "12px sans-serif")
      .text("");

    var circles = svg.selectAll(".bubble")
      .data(gSelectedDataSet)
      .enter().append("circle")
      .attr("class", "bubble")
      .attr("r", function(d) {
        return radiusScale(d.revenue)
      })
      .style("fill", function(d) { 
        var returnColor = "black";
        if (d[gCategoryName] in gColorMap) {
          return gColorMap[d[gCategoryName]]
        }
        
        return returnColor;
      })
      .on("mouseover", function(d) {
        tooltip.html(d.company + "<br><br> Revenue: " + d.revenue);
        tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
        return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
      })
      .on("mouseout", function() {
        return tooltip.style("visibility", "hidden");
      });

    var labels = svg.selectAll('.label')
      .data(gSelectedDataSet)
      .enter()
      .append('text')
      .attr('class', 'label')
      .style('fill', 'white')
      .style('font', '12px sans-serif')
      .text(node => node.company)
      .on("mouseover", function(d) {
        tooltip.html(d.company + "<br><br> Revenue: " + d.revenue);
        tooltip.style("visibility", "visible");
      })
      .on("mousemove", function() {
        return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
      })
      .on("mouseout", function() {
        return tooltip.style("visibility", "hidden");
      });

    var atRight = true;
    var rect = svg.append("rect")
      .attr("x", 10)
      .attr("y", 10)
      .attr("rx", 22)
      .attr("ry", 22)
      .style("fill", "lightgray")
      .attr("width", 64)
      .attr("height", 40)
      .on("click", function() {
        if (atRight === true) {
          simulation.force("x", forceXSplit).alphaTarget(0.2).force("collide", forceCollide);

          setAtRight(!atRight);
        } else {
          simulation.force("x", forceXCombine).alphaTarget(0.07);
          
          setAtRight(!atRight);
        }  
      });

    var circle = svg.append("circle")
      .attr("cx", 30)
      .attr("cy", 30)
      .attr("r", 16)
      .style("fill", "white")
      .on("click", function() {
        if (atRight === true) {
          simulation.restart()
            .force("x", forceXSplit)
            .alphaTarget(0.2)
            .force("collide", forceCollide);

          setAtRight(!atRight);
        } else {
          simulation.restart()
            .force("x", forceXCombine)
            .alphaTarget(0.2);

          setAtRight(!atRight);
        }  
      });

    var setAtRight = function(newValue) {
      atRight = newValue;
      circle.transition()
        .duration(250)
        .attr("cx", (atRight? (30) : (54)))
        .style("fill", "white");
      
      rect.transition()
        .duration(250)
        .style("fill", atRight? "lightgray" : "#C06C84");  
    };

    simulation.nodes(gSelectedDataSet).on('tick', function() {
      circles
        .attr("cx", function(d) { return d.x })
        .attr("cy", function(d) { return d.y });
      
      labels
        .attr("dx", function(d) { return d.x })
        .attr("dy", function(d) { return d.y })
        .attr("text-anchor", "middle");
    });
  }

  return publicScope;
}
