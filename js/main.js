
//anonymous function so nothing is in global scope
(function(){
    // pseudo-global variables
    var attrArray = ["P_UST","P_LDPNT_D2","P_DSLPM_D2","P_CANCR_D2",
                    "P_RESP_D2","P_PTRAF_D2","P_PWDIS_D2","P_PNPL_D2",
                    "P_PRMP_D2","P_PTSDF_D2","P_OZONE_D2","P_PM25_D2", "P_UST_D2"
        ];
    var expressed = attrArray[0];


    // begin script when window loads
    window.onload = setMap();

    // set up map
    function setMap(){

        // map dimensions
        var width = 960,
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
            
            var VaMd = map.selectAll(".states")
                .data(statesVM)
                .enter()
                .append("path")
                .attr("class", "states")
                .attr("d", path) 

            dcBlockGroup = joinData(dcBlockGroup, csvData);

            var colorScale = makeColorScale(csvData)

            setEnumerationUnits(dcBlockGroup, map, path, colorScale);

        };
    };

    function joinData(dcBlockGroup,csvData){
        // loop through csv to assign each set of csv attr values to corresponding block group
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

    function makeColorScale(data){
        var colorClasses = ['#ffffe5','#fff7bc','#fee391','#fec44f','#fe9929','#ec7014','#cc4c02','#8c2d04'];

        var colorScale = d3.scaleQuantile()
	        .range(colorClasses);

        var minmax = [0,100];

        colorScale.domain(minmax);

	    return colorScale;

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
            .style("fill",function(d){
                var value = d.properties[expressed];            
                if(value) {            	
                    return colorScale(d.properties[expressed]);            
                } else {            	
                    return "#ccc";            
                } 
            });
    };

})();