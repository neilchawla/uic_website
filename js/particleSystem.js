// Bounds of the data
const bounds = {};

const sceneObject = new THREE.Group();

const pointCloudGeometry = new THREE.BufferGeometry();
const pointCloudMaterial = new THREE.PointsMaterial({
    vertexColors: THREE.VertexColors,
    transparent: true,
    opacity: 0.6,
    size: 0.05
}); 

// Variables
var data = [];
var colors = [];
var points = [];
var zPoints = [];
var c = [];
var colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 30]);

const createParticleSystem = (d) => {
    pointCloudGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    pointCloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    var pointCloud = new THREE.Points(pointCloudGeometry, pointCloudMaterial);

    scene.add(pointCloud);
}

const createPlane = () => {
    const radius = (bounds.maxX - bounds.minX) / 2.0 + 1;
    const height = (bounds.maxY - bounds.minY) + 1;
    const planeGeometry = new THREE.PlaneGeometry(2 * radius, 1.25 * height);
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x889491,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });

    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.geometry.translate(0, (bounds.maxY - bounds.minY) / 30, 0);

    scene.add(plane);
}

const createScatterPlot = (zAxis) => {
    d3.select('#graph').select('svg').remove();
    var margin = {top: 10, right: 30, bottom: 30, left: 60};
    var width = 460 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var filteredData = data.filter(d => {
        return d.Z >= (zAxis - 0.02) && d.Z <= (zAxis + 0.02);;
    })

    var svg = d3.select('#graph')
        .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
        .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var xScale = d3.scaleLinear()
        .domain([bounds.minX, bounds.maxX])
        .range([0, width]);

    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale));

    var yScale = d3.scaleLinear()
        .domain(d3.extent(filteredData.map(d => d.Y)))
        .range([height, 0]);

    svg.append('g')
        .call(d3.axisLeft(yScale));

    const colorPalette = ["#00b4d8", "#0096c7", "#0077b6", "#023e8a", "#03045e"];

    var colors = d3.scaleLinear()
        .domain([0, 0.10, 0.8, 50, 357.19])
        .range(colorPalette);

    svg.append('g')
        .selectAll('dots')
        .data(filteredData)
        .enter()
        .append('circle')
            .attr('cx', d => xScale(d.X))
            .attr('cy', d => yScale(d.Y))
            .attr('r', 3)
            .style('fill', d => colors(d.concentration));
}

const brushing = (zAxis) => {
    for(var i = 0; i < data.length; i++) {
        var c = new THREE.Color();
        if((data[i].Z >= (zAxis - 0.05)) - (data[i].Z < (zAxis + 0.05))) {
            c.set(colorScale(data[i].concentration));
        } else {
            c.set('rgb(220, 220, 220)');
        }

        pointCloudGeometry.color[i].set(c);
    }
}

const createSlider = (d) => {
    createScatterPlot(zPoints[0]);

    var slider = d3.sliderBottom()
        .min(d3.min(zPoints))
        .max(d3.max(zPoints))
        .width(400)
        .tickFormat(d3.format('.02'))
        .ticks(10)
        .default(0)
        .on('onchange', val => {
            // d3.select('#slider').text(d3.format('.2%')(val));
            createScatterPlot(val);
            brushing(val)
;        });

    var s = d3.select('#slider')    
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30, 30)');

    s.call(slider);
}

const loadData = (file) => {
    // Read CSV
    d3.csv(file).then(function (fileData) {
        // Iterate over each row of the file
        fileData.forEach(d => {
            // get the min bounds
            bounds.minX = Math.min(bounds.minX || Infinity, d.Points0);
            bounds.minY = Math.min(bounds.minY || Infinity, d.Points1);
            bounds.minZ = Math.min(bounds.minZ || Infinity, d.Points2);

            // get the max bounds
            bounds.maxX = Math.max(bounds.maxX || -Infinity, d.Points0);
            bounds.maxY = Math.max(bounds.maxY || -Infinity, d.Points1);
            bounds.maxZ = Math.max(bounds.maxY || -Infinity, d.Points2);

            // Concentration bounds
            bounds.minConc = Math.min(bounds.minConc || Infinity, d.concentration);
            bounds.maxConc = Math.max(bounds.maxConc || -Infinity, d.concentration);

            // add the element to the data collection
            data.push({
                // concentration density
                concentration: Number(d.concentration),
                // Position
                X: Number(d.Points0),
                Y: Number(d.Points1),
                Z: Number(d.Points2),
                // Velocity
                U: Number(d.velocity0),
                V: Number(d.velocity1),
                W: Number(d.velocity2)
            });

            var color = new THREE.Color();
            color.set(colorScale(d.concentration));
            colors.push(color.r, color.g, color.b);

            points.push(Number(d.Points0), Number(d.Points2) - 5, Number(d.Points1));
            zPoints.push(Number(d.Points2));
            c.push(Number(d.concentration));
         });
       
        createParticleSystem(data);
        createPlane();
        // createScatterPlot(data[1].Z);
        createSlider(zPoints);
    })
};


loadData('data/058.csv');