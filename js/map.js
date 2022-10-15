const width = window.innerWidth;
const height = 600;

var active = d3.select(null)

var color = d3.scaleSqrt()
    .domain([2, 20])
    .range(d3.schemeReds[9]);

function getColor(scheme) {
    return d3.scaleLinear()
        .domain([0, 3])
        .range(scheme)
}

// create map svg
const mapSVG = d3.select(".map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", function() {
        return reset();
    });

// Map projection of the US
const projection = d3.geoAlbersUsa()
    .translate([width/2, height/2]);
const path = d3.geoPath(projection)

// Grouping of all the paths in the SVG
const g = mapSVG.append("g")
    .attr('class', 'center-container center-items us-state-g');

var tooltip = d3
.select(".map")
.append("div")
.attr("class", "tooltip")
.style("opacity", 0);

// Promise to load map layout
Promise.all([d3.json("./data/states-10m.json"),
    d3.json("./data/freq_by_state.json"),
    d3.csv("./data/frequency.csv"),
    d3.json("./data/stateData.json")])
    .then(([mapData, freqByState, freq, stateData]) => {

        // console.log(freqByState[0]);
        // console.log(freq);
        console.log(stateData)
        
        let states = topojson.feature(mapData, mapData.objects.states).features;

        // mapSVG.selectAll("circle")
        //     .data(freq)
        //     .enter()
        //     .append("circle")
        //     .attr("class", "murder-points")
        //     .attr("cx", function (d) {
        //         return projection([parseFloat(d.lng), parseFloat(d.lat)])[0];
        //     })
        //     .attr("cy", function (d) {
        //         return projection([parseFloat(d.lng), parseFloat(d.lat)])[1];
        //     })
        //     .attr("r", function (d) {
        //         let totalMurder = (parseInt(d.males) + parseInt(d.females)) / 8;
        //         console.log(totalMurder);
        //         return totalMurder.toString() + "px";
        //     })
        //     .attr("fill", function (d) {
        //         console.log(d);
        //     if ((d.males + d.females) > 10000) {
        //         return "#fbb4ae";
        //     } else {
        //         return "#b3cde3";
        //     }
        //     })

        // Render data
        mapSVG.selectAll("path")
        .data(states)
        .enter().append("path")
        .attr("class", "states")
        .attr("d", path)
        .attr("fill", function(d) {
            let name = d.properties.NAME;
            if (name in stateData)
                return color(d.rate = stateData[d.properties.name]['count_per_population']);
            else
                return color(d.rate = 0)
        })
        .on("mousemove", function(d) {
            // console.log(stateData);
            // if (active.node() === this) return;

            console.log(stateData[d.properties.name]);

            var location = d3.mouse(this);
            tooltip.transition().duration(200).style("opacity", 0.8);
            tooltip.html(
                "<div><label>Location: </label>" + d.properties.name + "</div>" +
                "<div><label>Total Deaths: </label>" + stateData[d.properties.name].count + "</div>" + 
                "<div><label> Males: " + stateData[d.properties.name].genderMale + "</div>" + 
                "<div><label> Females: " + stateData[d.properties.name].genderFemale + "</div>"
            )
            .style("left", d3.event.pageX + 30 + "px")
            .style("top", d3.event.pageY + 30 + "px");

            // var html = "";

            // console.log(d);

            // html += "<div class=\"tooltip_container\">";
            // html += "<span class=\"tooltip_key\">";
            // html += d.properties.NAME;
            // html += "</span>";
            // html += "<span class=\"tooltip_value\">Male: ";
            // console.log(stateData[d.properties.name])
            // html += stateData[d.properties.name].genderMale;
            // html += "</span>";
            // html += "<span class=\"tooltip_value\">Female: ";
            // html += stateData[d.properties.name].genderFemale;
            // html += "</span>";
            // html += "<span class=\"tooltip_value\">Deaths: ";
            // html += stateData[d.properties.name].count;
            // html += "</div>";

            // html += "<div>";
            // html += "</span>";
            // html += "<span class=\"tooltip_value\">Age 18+: ";
            // html += stateData[d.properties.name].ageGroup3;
            // html += "</span>";
            // html += "<span class=\"tooltip_value\">Age 13-18: ";
            // html += stateData[d.properties.name].ageGroup2;
            // html += "</span>";
            // html += "<span class=\"tooltip_value\">Age 1-12: ";
            // html += stateData[d.properties.name].ageGroup1;
            // html += "</div>";

            // $("#tooltip-container").html(html);
            // $(this).attr("fill-opacity", "0.8");
            // $("#tooltip-container").show();

            // // var coordinates = d3.pointer(this);

            // var map_width = $('.us-state-g')[0].getBoundingClientRect().width;

            // if (d3.event.layerX < map_width / 2) {
            //     d3.select("#tooltip-container")
            //         .style("top", (d3.event.layerY + 15) + "px")
            //         .style("left", (d3.event.layerX + 15) + "px");
            // } else {
            //     var tooltip_width = $("#tooltip-container").width();
            //     d3.select("#tooltip-container")
            //         .style("top", (d3.event.layerY + 15) + "px")
            //         .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
            // }
        })
        .on("mouseout", function (d, i) {
            console.log("mouseout executed");
            tooltip.transition().duration(500).style("opacity", 0);
          })
        .on('click', clicked);

        
    });