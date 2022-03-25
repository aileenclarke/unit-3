// Add all scripts to the JS folder

// r. 
window.onload = function(){
    // svg dimension variables
    var w = 900, h = 500;
    
    // container block
    var container = d3.select("body") //  select body element from DOM and return to variable container
        .append("svg") // add a new svg in the body
        .attr("width", w) // assign width
        .attr("height", h) // assign height
        .attr("class", "container") // assign a class as the block name (here, "container")
        .style("background-color", "rgba(0,0,0,0.2)"); // svg background color

    // innerRect block
    var innerRect = container.append("rect") // put a new rect in the svg
        .datum(400)
        .attr("width", function(d){ // rectangle width
            return d * 2; //400 * 2 = 800
        })
        .attr("height", function(d){ // rectangle height
            return d; // 400
        })
        .attr("class", "innerRect") // class name
        .attr("x", 50) // position from left on the x axis
        .attr("y", 50) // position from the top on the y axis
        .style("fill", "#FFFFFF"); // fill color

    // create data array
    var cityPop = [
        { 
            city: 'Madison',
            population: 233209
        },
        {
            city: 'Milwaukee',
            population: 594833
        },
        {
            city: 'Green Bay',
            population: 104057
        },
        {
            city: 'Superior',
            population: 27244
        }
    ];

    var circles = container.selectAll(".circles") // create empty selection in order to create new elements (circles) based on dataArray
        .data(cityPop) // feed array to .data operator
        .enter() // no parameters, joins data to selection
        // .append and .attr act as loop and apply each operator for each value in the dataArray
        .append("circle") // add circle for each datum 
        .attr("class", "circles") // apply class name to all circles
        .attr("id",function(d){
            return d.city; // return the the city property of the current array value d
        })
        .attr("r", function(d, i){
            var area = d.population * .01;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d, i) {
            return 90 + (i *180);
        })
        .attr("cy", function(d){
            return 450 - d.population * .0005;
        });
};
