//

// begin script when window loads
window.onload = setMap();

// set up map
function setMap(){

    // map dimensions
    var width = 960,
        height = 460;

    // new svg container to hold map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    // create albers projection centered on dc
    var projection = d3.geoAlbers()
        .center([0,39])
        .rotate([77,0,0])
        .parallels([29.5, 45.5])
        .scale(100000)
        .translate([width/2, height/9]);

    var path = d3.geoPath()
        .projection(projection);

    var promises = [];    
    promises.push(d3.csv("data/EJData.csv")); //load attributes from csv    
    promises.push(d3.json("data/DC_BG.topojson")); //load background spatial data    
    Promise.all(promises).then(callback);
    
    /*
    // use Promise.all to parallelize asynchronous data loading
    // use d3.method to fetch data
    var promises = [
        d3.csv("data/EJData.csv"),
        d3.json("data/DC_BG.topojson")
    ];
    Promise.all(promises).then(callback);
    */

    // create callback function
    function callback(data){
        var csvData = data[0],
            blockGroup = data[1];
        console.log(csvData);
        console.log(blockGroup);
        
        // translate topojson to geojson
        var dcBlockGroup = topojson.feature(blockGroup, blockGroup.objects.dc_bg10).features;
        console.log(dcBlockGroup);

        //TKK reread example 2.3
        var blockgroups = map.selectAll(".blockgroups")
            .data(dcBlockGroup)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "blockgroups " + d.properties.GEOID10;
            })
            .attr("d", path);
            
    };
};