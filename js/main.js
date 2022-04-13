
//anonymous function so nothing is in global scope
(function(){
    // pseudo-global variables
    var attrArray = ["P_UST","P_LDPNT_D2","P_DSLPM_D2","P_CANCR_D2",
                    "P_RESP_D2","P_PTRAF_D2","P_PWDIS_D2","P_PNPL_D2",
                    "P_PRMP_D2","P_PTSDF_D2","P_OZONE_D2","P_PM25_D2", "P_UST_D2"];
    var expressed = attrArray[0];


    // begin script when window loads
    window.onload = setMap();

    // set up map
    function setMap(){

        // map dimensions
        // set width of map as a fraction based on the browser window's 'innerWidth'
        var width = window.innerWidth * .5, // set to .5 or 50% of with window's innerWidth
            height = 500;

        // new svg container to hold map
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        // create albers projection centered on dc
        var projection = d3.geoAlbers()
            // recommend setting center coord with center lat and rotate long
            .center([0,39]) // long, lat of developable surface's center
            .rotate([77,0,0]) // long, lat, roll - central meridian and central parallel
            .parallels([29.5, 45.5]) // standard parallel(s)
            .scale(130000) // factor by which distances between pts are multiplied
            .translate([width/2, height/250]); // offsets pixel coordinates of the projection's center in the svg

        // path generator that takes projection (above) as parameter
        // tktk ask for clarification
        var path = d3.geoPath()
            .projection(projection);
        
        // parallelize asynchronous data loading 
        var promises = [];    
            promises.push(d3.csv("data/EJData.csv")); // d3.csv parses csv, .push adds to array "promises"
            promises.push(d3.json("data/DC_BG.topojson")); // parse topojson background spatial data, push to array 
            promises.push(d3.json("data/VAMD.topojson")); // parse topojson background spatial data, push to array 
            // Promise.all takes an iterable of promises as input and returns a single promise
            Promise.all(promises).then(callback);
        


        // create callback function
        function callback(data){
            var csvData = data[0], 
                blockGroup = data[1], // holds topojson data that becomes parameter for topojson.feature
                states = data[2];
            console.log(csvData);
            console.log(blockGroup);
            console.log(states);
            
            // translate topojson to geojson
            // topojson.feature takes 2 parameters: variable holding topojson data and 
            // the object within the variable containing the data we want to convert
            var dcBlockGroup = topojson.feature(blockGroup, blockGroup.objects.dc_bg10).features, // object name is topojson,
                statesVM = topojson.feature(states, states.objects.VAMD).features;
            
            // draw surrounding geographies to map
            var VaMd = map.selectAll(".states")
                .data(statesVM)
                .enter()
                .append("path")
                .attr("class", "states")
                .attr("d", path) 

            // call the joinData function and assign as local variable
            dcBlockGroup = joinData(dcBlockGroup, csvData);

            //set local variable colorScale as result of makeColorScale function  
            var colorScale = makeColorScale(csvData)

            // call the setEnumerationUnits function
            setEnumerationUnits(dcBlockGroup, map, path, colorScale);

            // call the setChart function
            setChart(csvData, colorScale);

        };
    };

    // tktk come back and review
    // create joinData function to connect geographies and attribute
    function joinData(dcBlockGroup,csvData){
        // loop through csv to assign each set of csv attribute values to corresponding block group based on GEOID10
        for (var i=0; i<csvData.length; i++){
            var csvBG = csvData[i]; 
            var csvKey = csvBG.GEOID10;

            // loop through block groups to find correct region
            for (var a=0; a<dcBlockGroup.length; a++){
                var geojsonProps = dcBlockGroup[a].properties; // current geojson properties
                var geojsonKey = geojsonProps.GEOID10;
                
                // where keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey){
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvBG[attr]); // get csv attr value. parseFloat parses an arg and returns floating point number
                        geojsonProps[attr] = val;   // assign attr and value to geojson properties
                    });
                };
            };
        };
        
        return dcBlockGroup;
    }

    // create color scale
    function makeColorScale(data){
        // array of colors, in order from lightest to darkest
        var colorClasses = ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#99000d'];

        // create color scale generator
        var colorScale = d3.scaleQuantile()
	        // range array with 8 output values
            .range(colorClasses);

        // set minimum and maximum
        var minmax = [0,100];

        // assign two- value array as scale domain (input range)
        colorScale.domain(minmax);

	    return colorScale;

    };

    // function to create coordinated visualization
    // input csvData and colorScale to draw and color bars
    function setChart(csvData, colorScale){
        // chart frame dimensions
        // set width of chart as a fraction based on the browser window's 'innerWidth'
        var chartWidth = window.innerWidth * .425 , // set width as 42.5% of the window's innerWidth property
            chartHeight = 473,
            leftPadding = 25,
            rightPadding = 2,
            topBottomPadding = 5,
            // set chart inner width and height to make room for axes
            chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

        // create svg element fo hold bar chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");
        
        // create a rectangle for chart background fill
        var chartBackground = chart.append("rect")
            .attr("class", "chartBackground")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        // create scale to size bars proportionally to frame
        var yScale = d3.scaleLinear()
            .range([463, 0])
            .domain([0, 100]);

        // create and append rectangles to the chart container for each enumeration unit.
        var bars = chart.selectAll(".bars") // tktk bar v 
            .data(csvData)
            .enter()
            .append('rect')
            // sort data values before applying featuers to 'rect'
            .sort(function(a, b){
                return a[expressed]-b[expressed]
            })
            .attr("class", function(d){
                return "bars" + d.GEOID10;
            })
            // set width to 1/(n-1), where 1 is the total chart inner width and n is the length of the csv feature array
            .attr("width", chartInnerWidth / (csvData.length - 1))
            // x = the horizontal coordinate of the left side of the rectangle
            // i is the index of the datum
            .attr("x", function(d,i){
                return i * (chartInnerWidth / csvData.length) +leftPadding;
            })
            // apply yScale to each attribute value to set the bar height
            .attr("height", function(d){
                return 463 - yScale(parseFloat(d[expressed]));
            })
            // the verticle coordinate of the rectangle's bottom
            // subtract scale output (yScale...) so that bars "grow" up from bottom of svg
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            // apply color
            .style("fill", function(d){
                return colorScale(d[expressed]);
            });

        // annotate bars with attribute value text
        // follow pattern from bars block
        /*
        var numbers = chart.selectAll(".numbers")
            .data(csvData)
            .enter()
            .append("text") // append text element 
            .sort(function(a, b){
                return a[expressed]-b[expressed]
            })
            .attr("class", function(d){
                return "numbers " + d.GEOID10;
            })
            // center justify text
            .attr("text-anchor", "middle")
            // add half of the bar's width to horizontal coordinate to center number id bar
            .attr("x", function(d, i){
                var fraction = chartWidth / csvData.length;
                return i * fraction + (fraction - 1) / 2;
            })
            // use same yScale but add 15 pixels to lower the text to sit inside bar
            .attr("y", function(d){
                return chartHeight - yScale(parseFloat(d[expressed])) + 15;
            })
            // place expressed attribute in text element
            .text(function(d){
                return d[expressed];
            });
        */
        
        // create text element for chart title and add to chart
        var chartTitle = chart.append("text")
            .attr("x", 40)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text("Number of Variable " + expressed[3] + " in each block group");
        
        // create vertical axis generator
        var yAxis = d3.axisLeft()
            .scale(yScale);

        // place axis
        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        
        //create frame for chart border
        var chartFrame = chart.append("rect")
            .attr("class", "chartFrame")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);
    };


    function setEnumerationUnits(dcBlockGroup, map, path, colorScale){
        var blockgroups = map.selectAll(".blockgroups")
            .data(dcBlockGroup) // requires input as array but in order to draw individually, add .features to the end of topojson.feature()
            .enter()
            .append("path") // path element appended to 
            .attr("class", function(d){ // add class attribute blockgroups and unique class name based on GEOIO10 field
                return "blockgroups " + d.properties.GEOID10;
            })
            .attr("d", path)
            // style operator with anonymous funtion that applies colorScale to the currently expressed attribute to the fill
            .style("fill",function(d){
                var value = d.properties[expressed];            
                if(value) {            	
                    return colorScale(d.properties[expressed]);            
                // if there's no value for the expressed attribute, return a gray fill
                } else {            	
                    return "#ccc";            
                } 
            });
    };

})();