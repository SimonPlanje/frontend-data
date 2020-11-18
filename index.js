//----------------------------------------------------------------------
//D3 ---------⬇️⬇️⬇️-------- d3 logic ---------⬇️⬇️⬇️------------- D3
//----------------------------------------------------------------------
//---- MAKING THE MAP -------

const svg = d3.select('svg')

const height = parseFloat(svg.attr('height'))
const width = +svg.attr('width')

const projection = d3
  .geoMercator()
  .center([5, 52.5]) // GPS of location to zoom on
  .scale(8000) // This is like the zoom
const pathGenerator = d3.geoPath().projection(projection)
//geoPath: this will convert the data path into an svg path string that we can use on svg paths
//geoMercator: this is the type of projection type

const g = svg.append('g')
var radius = '2px'


//Bepaal kleur voor circles
var color = d3.scaleOrdinal(d3.schemeSpectral[4])
//source: https://www.d3-graph-gallery.com/graph/bubblemap_buttonControl.html

//ZOOMEN
svg.call(d3.zoom().on('zoom', zoomed))

function zoomed({ transform }) {
  g.attr('transform', transform)
}
//source: https://www.youtube.com/watch?v=9ZB1EgaJnBU&t=904s

g.append('path')
  .attr('class', 'sphere')
  .attr('d', pathGenerator({ type: 'Sphere' }))

d3.json('https://cartomap.github.io/nl/wgs84/gemeente_2020.topojson').then(
  (data) => {
    const gemeentes = topojson.feature(data, data.objects.gemeente_2020)

    g.selectAll('path')
      .data(gemeentes.features)
      .enter()
      .append('path')
      .attr('class', 'gemeente')
      .attr('d', pathGenerator)
      .append('title')
      .text((d) => d.properties.statnaam)
  }
)
//----PLOTTING THE LON LAT AS CIRCLES ON THE MAP ⬇️⬇️⬇️------
d3.json(
  'https://raw.githubusercontent.com/SimonPlanje/frontend-data/main/onlineData/longLatDisabled.json'
).then(data => {


console.log(data)
color.domain(data.map(d => d.id))

console.log(color.domain())


g.selectAll('circle').data(data)
  .enter()
  .append('circle')
  .attr('class', (d) => d.id)
  .attr(
    'cx',
    (d) =>
      projection([
        d.accessPointLocation[0].longitude,
        d.accessPointLocation[0].latitude,
      ])[0]
  )
  .attr(
    'cy',
    (d) =>
      projection([
        d.accessPointLocation[0].longitude,
        d.accessPointLocation[0].latitude,
      ])[1]
  )
  .attr('r', radius)
  .attr('fill', (d) => color(d.id))
  .attr('stroke', (d) => color(d.id))
  .attr('fill-opacity', 0.3)
  

g.selectAll('circle').data(data).exit().remove()
  // d3.selectAll('.checkbox').on('change', update)
  // update()


    })




  //update function for the checkboxes




//legend
svg
  .selectAll('svg')
  .data(color.domain())
  .enter()
  .append('circle')
  .attr('transform', (d, i) => `translate(${100},${i * 30 + 20})`)
  .attr('r', 6)
  .attr('fill', (d) => color(d))
  .attr('stroke', (d) => color(d))
  .attr('fill-opacity', 0.3)

svg
  .selectAll('svg')
  .data(color.domain())
  .enter()
  .append('text')
  .text((d) => d)
  .style('fill', 'white')
  .attr('alignment-baseline', 'middle')
  .attr('transform', (d, i) => `translate(${120},${i * 30 + 20})`)