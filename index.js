// 1 Haal de RDW data op
// 2 Selecteer de kolom in de dataset die ik wil onderzoeken/visualiseren
// 3 Schoon deze data op

const endpoint = 'https://raw.githubusercontent.com/SharonV33/frontend-data/main/data/parkeergarages_1000.json'
const areaIdColumn = getData;
const selectedColumn = 'parkingFacilityInformation';

async function getData(url){
    const response = await fetch(url)
    const data = await response.json()

    return data
}

getData(endpoint).then(RDWData => {


  //get data all data
  const allData = filterAccesspoint(RDWData, selectedColumn);

  // removes all the arrays around the objects
  const removeArrays = removeArray(allData);

  //replace undifined values with null
  const emptyFixed = fixEmptyKeys(removeArrays)

  //filter out the long lat
  const longLatArray = getLocationArray(emptyFixed);

  //Alle null waardes weghalen
  const removeNullValues = removeNulls(longLatArray)

  //Weer een een array om object weghalen
  const removeArrayLonLat = removeArray(removeNullValues);

  // //make array of the long lat of every object
  // const geoArray = createLongLatArray(removeArrayLonLat)
  // console.log(JSON.stringify(geoArray))


  //Get disabled Data
  const disabledArray = filterDisabled(RDWData, selectedColumn)

  const removeArrayDisabled = removeArray(disabledArray)

  // const removeObjectsDisabled = removeObjects(removeArrayDisabled)

  //Calls the function that replaces undefined for {} so i can add and id to the object
  const objectArray = addObjectUndef(removeArrays)

  //adds id's to the lonlat data objects so I can combine it with the other data variable
  const addIdToLonLat = addIds(objectArray)

  //adds id's to the disabled data objects so I can combine it with the other data variable
  const addIdToDisabled = addIds(removeArrayDisabled)


const combineJSON = addIdToLonLat.map((item) => {
  // console.log('dit is t item: ', item)
  return{
    ...item,
    ...addIdToDisabled.filter(data => data.id === item.id)[0]
    //https://flaviocopes.com/how-to-merge-objects-javascript/
  }
})

  // console.log('volledige JSON: ', combineJSON)

  //and than as last we filter out the not usable parking spots
  const filterUselessData = filterData(combineJSON)
  // console.log(filterUselessData)

  //Aantal loops om classes toe te voegen aan de dataset
  const addsClassesNone = addClassesNone(filterUselessData)
  const addsClassesDisabled = addClassesDisabled(addsClassesNone)
  const addsClassesCharging = addClassesCharging(addsClassesDisabled)
  const addsClassesBoth = addClassesBoth(addsClassesCharging)
  // console.log('both: ', JSON.stringify((addsClassesBoth)))



})



//FUNCTION PART

//remove data that cant be used
function filterData(data){
  return data.filter(result => result.accessPointLocation);
}



function addObjectUndef(data){
  return data.map(result => {
    if(result == undefined){
      return result = {}
    }else{
      return result
    }
  })
}

function addIds(data){
  return data.map((item, index) => {
    if(index !== undefined){
      return {...item, id: index + 1}
    }else{
      return {id: index + 1}
    }
    //https://stackoverflow.com/questions/50023291/add-id-to-array-of-objects-javascript
  })
}

function addClassesNone(data){
  return data.map((item) => {
    // console.log('item', item)
    if(item.chargingPointCapacity == 0 && item.disabledAccess == false){
      return {...item, id: 'none'}
    }else{
      return item
    }

  })
}

function addClassesDisabled(data){
  return data.map((item) => {
  if(item.chargingPointCapacity == 0 && item.disabledAccess == true){
    return {...item, id: 'disabled'}
  } else{
    return item
  }
})
}

function addClassesCharging(data){
  return data.map((item) => {

  if(item.chargingPointCapacity > 0 && item.disabledAccess == false){
    return {...item, id: 'charging'}
  } else{
    return item
  }
})
}

function addClassesBoth(data){
  return data.map((item) => {
    // console.log('item', item)
    if(item.chargingPointCapacity > 0 && item.disabledAccess == true){
      return {...item, id: 'both'}
    }else{
      return item
    }

  })
}

//get disbaled data 
function filterDisabled(dataArray, index) {
  return dataArray.map(item => item[index].specifications )
}

// function removeObjects(data){
//   return data.filter(result => result.chargingPointCapacity !== undefined);
// }

function filterAccesspoint(dataArray, index) {
    return dataArray.map(item => item[index].accessPoints )
  }


function getLocationArray(data){
    return data.map(item => item.accessPointLocation )
}


function removeArray(data){
    return data.map(result => result[0])
}


function removeNulls(data){
    return data.filter(result => result !== null);
}

// function createLongLatArray(data){
//     let lat = data.map(result => result.latitude )
//     let long = data.map(result => result.longitude)
//     return lat.map((latitude, index) =>{
//         return [latitude, long[index]]}) 
// }


function fixEmptyKeys(data){
    
    // Create an object with all the keys in it
    // This will return one object containing all keys the items
    let obj = data.reduce((res, item) => ({...res, ...item}));

    // Get those keys as an array
    let keys = Object.keys(obj);

    // Create an object with all keys set to the default value null
        let def = keys.reduce((result, key) => {
        result[key] = null
        return result;
      }, {});

      // Use object destrucuring to replace all default values with the ones we have
      return data.map((item) => ({...def, ...item}));
      //source: https://stackoverflow.com/questions/47870887/how-to-fill-in-missing-keys-in-an-array-of-objects/47871014#47871014?newreg=7adc7a5e48b7436d99619b4aad68d8f8
}


//----------------------------------------------------------------------
//D3 ---------⬇️⬇️⬇️-------- d3 logic ---------⬇️⬇️⬇️------------- D3
//----------------------------------------------------------------------


//---- MAKING THE MAP -------

const svg = d3.select('svg');

const height = parseFloat(svg.attr('height'));
const width = +svg.attr('width');

const projection = d3.geoMercator()
.center([5, 53])                // GPS of location to zoom on
.scale(7000)                    // This is like the zoom
const pathGenerator = d3.geoPath().projection(projection)
//geoPath: this will convert the data path into an svg path string that we can use on svg paths
//geoMercator: this is the type of projection type

const g = svg.append('g')
var radius = '2px'
//Bepaal kleur voor circles
var color = d3.scaleOrdinal()
    .domain(['none', 'both', 'disabled', 'charging'])
    .range(['pink', 'red', 'purple', 'lime'])


//source: https://www.d3-graph-gallery.com/graph/bubblemap_buttonControl.html

//ZOOMEN 
svg.call(d3.zoom()
  .on('zoom', zoomed));

function zoomed({transform}) {
g.attr('transform', transform);
}

g.append('path')
.attr('class', 'sphere')
.attr('d', pathGenerator({type: 'Sphere'}));


d3.json('https://cartomap.github.io/nl/wgs84/gemeente_2020.topojson')
.then(data => {

  const gemeentes = topojson.feature(data, data.objects.gemeente_2020 )

g.selectAll('path').data(gemeentes.features)
      .enter().append('path')
      .attr('class', 'gemeente')
        .attr('d', pathGenerator)
  .append('title')
      .text(d => d.properties.statnaam)

      })



////----PLOTTING THE LON LAT AS CIRCLES ON THE MAP ⬇️⬇️⬇️------
d3.json('https://raw.githubusercontent.com/SimonPlanje/frontend-data/main/onlineData/longLatDisabled.json')
  .then(data => {

    g
    .selectAll('circle').data(data)
    .enter().append('circle')
    .attr('class', function(d){ return d.id })
    .attr('cx', d => projection([d.accessPointLocation[0].longitude, d.accessPointLocation[0].latitude])[0])
    .attr('cy', d => projection([d.accessPointLocation[0].longitude, d.accessPointLocation[0].latitude])[1])
    .attr('r', radius)
    .attr('fill', function(d){ return color(d.id)})
    .attr('stroke', function(d){ return color(d.id)})
    .attr('fill-opacity', .3)
    //gebruik de color variable om de true en false disabled access een verschillende kleur te geven.

//legend
    svg.append('circle').attr('cx',80).attr('cy',100).attr('r', 6).attr('fill', 'red').attr('stroke', 'red').attr('fill-opacity', '.4')
    svg.append('circle').attr('cx',80).attr('cy',130).attr('r', 6).attr('fill', 'lime').attr('stroke', 'lime').attr('fill-opacity', '.4')
    svg.append('circle').attr('cx',80).attr('cy',160).attr('r', 6).attr('fill', 'purple').attr('stroke', 'purple').attr('fill-opacity', '.4')
    svg.append('circle').attr('cx',80).attr('cy',190).attr('r', 6).attr('fill', 'pink').attr('stroke', 'pink').attr('fill-opacity', '.4')
    svg.append('text').attr('x', 100).attr('y', 100).text('Opladen + invaliden').attr('fill', 'white').style('font-size', '15px').attr('alignment-baseline','middle')
    svg.append('text').attr('x', 100).attr('y', 130).text('Alleen opladen').attr('fill', 'white').style('font-size', '15px').attr('alignment-baseline','middle')
    svg.append('text').attr('x', 100).attr('y', 160).text('Alleen invaliden').attr('fill', 'white').style('font-size', '15px').attr('alignment-baseline','middle')
    svg.append('text').attr('x', 100).attr('y', 190).text('Geen invaliden en oplaadpunt').attr('fill', 'white').style('font-size', '15px').attr('alignment-baseline','middle')


 // This function is gonna change the opacity and size of selected and unselected circles
 function update(){

  // For each check box:
  d3.selectAll('.checkbox').each(function(d){
    cb = d3.select(this);
    group = cb.property('value')

    console.log(d3.selectAll('.disabled'))

    // If the box is check, I show the group
    if(cb.property('checked')){
      g.selectAll('.'+group)
      .transition()
      .duration(1000)
      .style('opacity', 1)
      .attr('r', radius)

    // Otherwise I hide it
    }else{
      g.selectAll('.'+group)
      .transition()
      .duration(1000)
      .style('opacity', 0)
      .attr('r', 0)
    }
  })
}
d3.selectAll('.checkbox').on('change', update)

update()



    })




