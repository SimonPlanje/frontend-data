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
    // console.log(data.objects.gemeente_2020)
    const gemeentes = topojson.feature(data, data.objects.gemeente_2020)
    // console.log(gemeentes)
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


d3.json('https://raw.githubusercontent.com/SimonPlanje/frontend-data/main/routeData.json')
  .then(data => {

    g.selectAll('circle').data(data)
      .enter().append('circle')
      .attr('class', 'route')
      .attr('cx', d => console.log(projection([d.longitude, d.latitude])[0]))
      .attr('cy', d => console.log(projection([d.longitude, d.latitude])[1]))
      .attr('r', '20')
      // .attr('height', '20')
      .attr('fill', 'white')


  })


// const deData = routeData[0]
// console.log(deData)

// const filterData = removeUndef(deData)
// console.log('filtereddata', filterData)

// function removeUndef(data){
//   return data.filter(result =>{
//     return result.wkb_geometry !== null
//   } )
// }

// const formatData = topojson.feature(deData[0], deData[0]?.wkb_geometry )
// console.log(formatData)

// const formatData = topojson.feature(deData, deData.wkb_geometry.coordinates)
// console.log(formatData)
// const makeRouteMap = routeMap(deData)




// function routeMap(data){
// g.selectAll('circle').data(data)
// .enter()
// .append('circle')
// .attr('class', 'route')
// .attr('cx', (d) =>  projection(((d.wkb_geometry.coordinates[0])[0]))[0])
// .attr('cy', (d) =>  projection(((d.wkb_geometry.coordinates[0])[0]))[1])
// .attr('r', 20)
// .attr('fill', 'white')

// }



//----PLOTTING THE LON LAT AS CIRCLES ON THE MAP ⬇️⬇️⬇️------
d3.json(
  'https://raw.githubusercontent.com/SimonPlanje/frontend-data/main/onlineData/longLatDisabled.json'
).then(data => {

  //Bepaal kleur voor circles
  let color = d3.scaleOrdinal()
    .domain(['disabled', 'charging', 'both', 'none'])
    .range(['yellow', 'purple', 'lime', 'red'])
  //source: https://www.d3-graph-gallery.com/graph/bubblemap_buttonControl.html

  const colorValue = d => d.id

  // const color = d3.scaleOrdinal(d3.schemeCategory10)

  let idInput = color.domain()

  // g.selectAll('circle').data(data)
  //   .enter()
  //   .append('circle')
  //   .attr('class', (d) => d.id)
  //   .attr('cx', (d) => projection([d.accessPointLocation[0].longitude, d.accessPointLocation[0].latitude])[0])
  //   .attr('cy', (d) => projection([d.accessPointLocation[0].longitude, d.accessPointLocation[0].latitude])[1])
  //   .attr('r', radius)
  //   .attr('fill', (d) => color(colorValue(d)))
  //   .attr('stroke', (d) => color(colorValue(d)))
  //   .attr('fill-opacity', 0.3)

  //   function updateDots(data) {
  //     const dots = g.selectAll('circle')
  //       .data(data)

  //     dots
  //       .attr('cx', (d) => console.log('long', projection([d.accessPointLocation[0].longitude, d.accessPointLocation[0].latitude])[0]))
  //       .attr('cy', (d) => console.log('lat', projection([d.accessPointLocation[0].longitude, d.accessPointLocation[0].latitude])[1]))

  //     dots.enter()
  //       .append('circle')
  //       .attr('r', radius)
  //       .attr('class', d => d.id)
  //       .attr('fill', (d) => color(d.id))
  //       .attr('stroke', (d) => color(d.id))
  //       .attr('fill-opacity', 0.3)
  //       .attr('r', 6)
  //       .attr('cx', (d) => projection([d.accessPointLocation[0].longitude, d.accessPointLocation[0].latitude])[0])
  //       .attr('cy', (d) => projection([d.accessPointLocation[0].longitude, d.accessPointLocation[0].latitude])[1])


  //     dots.exit()
  //       .remove()
  //   }

  //   // Make a div inside form element for all payment methods
  //   const form = d3.select('form')
  //     .selectAll('div')
  //     .data(idInput)
  //     .enter()
  //     .append('div')
  //     .attr('class', 'checkBox')


  //   // Make radiobuttons inside the input form
  //   form.append('input')
  //     .attr('type', 'radio')
  //     .attr('name', 'radio')
  //     .on('change', (d, i) => {
  //       if (i === 'disabled') {
  //         i = ['disabled', 'both']
  //       } else if (i === 'charging') {
  //         i = ['charging', 'both']
  //       } else if (i === 'both') {
  //         i = ['charging', 'both', 'none', 'disabled']
  //       } else if (i === 'none') {
  //         i = ['none']
  //       }
  //       update(i); // Call function to reassing dots
  //       console.log(i)
  //     })

  //   // inside the div make a label with the text of the year array
  //   form.append('label')
  //     .attr('for', (d, i) => (d))
  //     .text((d, i) => (d))
  //     .style('background-color', (d, i) => color(d))



  //   function update(i) {

  //     const checkedBoxes = data.filter((row) => i.includes(row.id))

  //     updateDots(checkedBoxes);
  //     console.log(checkedBoxes)
  //   }

})


// g.selectAll('circle')
//     .data([0])
//     .enter()
//     .append('circle')
//     .attr('cx', )
//     .append('title')
//     .text((d) => d.properties.statnaam)






//legend
// svg
//   .selectAll('svg')
//   .data(color)
//   .enter()
//   .append('circle')
//   .attr('transform', (d, i) => `translate(${100},${i * 30 + 20})`)
//   .attr('r', 6)
//   .attr('fill', (d) => color(d))
//   .attr('stroke', (d) => color(d))
//   .attr('fill-opacity', 0.3)

// svg
//   .selectAll('svg')
//   .data(color)
//   .enter()
//   .append('text')
//   .text((d) => d)
//   .style('fill', 'white')
//   .attr('alignment-baseline', 'middle')
//   .attr('transform', (d, i) => `translate(${120},${i * 30 + 20})`)







//plotting the route data


