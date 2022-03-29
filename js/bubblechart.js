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

    // create the scale and set range and domain
    var x = d3.scaleLinear()  
        .range([90, 810])
        .domain([0, 3.3]);

    // find the minimum and maximum populations in array cityPop   
    var minPop = d3.min(cityPop, function(d){
        return d.population;
    });

    var maxPop = d3.max(cityPop, function(d){
        return d.population;
    });
    
    // create scale for circles center and y coor
    var y = d3.scaleLinear()
        .range([450, 50]) //was 440, 95
        .domain([0, 700000]); //was minPop, maxPop

    // color scale generator
    var color = d3.scaleLinear()
        .range([
            "#FDBE85",
            "#D94701"
        ])
        .domain([
            minPop,
            maxPop
        ]);

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
            return x(i);
        })
        .attr("cy", function(d){
            return y(d.population);
        })
        .style("fill", function(d, i){
            return color(d.population);
        })
        .style("stroke", "#000");

        // create y axis generator
        var yAxis = d3.axisLeft(y);

        // create axis g element and add axis
        var axis = container.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(50,0)")
            .call(yAxis) 
        
        // create text element and add title
        var title = container.append("text")
            .attr("class", "title")
            .attr("text-anchor", "middle") // center justify text in the container element
            .attr("x", 450)
            .attr("y", 30)
            .text("City Populations");

        var labels = container.selectAll(".labels") // why do we use .selectAll? 
            .data(cityPop)
            .enter()
            .append("text")
            .attr("class", "labels")
            .attr("text-anchor", "left")
            .attr("y", function(d){
                //vertical position centered on each circle
                return y(d.population);
            });
    
        //first line of label
        var nameLine = labels.append("tspan")
            .attr("class", "nameLine")
            .attr("x", function(d,i){
                //horizontal position to the right of each circle
                return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
            })
            .text(function(d){
                return d.city;
            });

        //create format generator
        var format = d3.format(",");    

        //second line of label
        var popLine = labels.append("tspan")
            .attr("class", "popLine")
            .attr("x", function(d,i){
                //horizontal position to the right of each circle
                return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
            })
            .attr("dy", "15") // vertical offset
            .text(function(d){
                return "Pop. " + format(d.population);
            });

};
