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
  // console.log(allData);

  // removes all the arrays around the objects
  const removeArrays = removeArray(allData);
  // console.log(removeArrays)

  //replace undifined values with null
  const emptyFixed = fixEmptyKeys(removeArrays)
  // console.log('alle empty slots zijn weg: ', emptyFixed)

  //filter out the long lat
  const longLatArray = getLocationArray(emptyFixed);
  // console.log('LongLat: ', longLatArray)

  //Alle null waardes weghalen
  const removeNullValues = removeNulls(longLatArray)
  // console.log('Only log array: ', removeNullValues)

  //Weer een een array om object weghalen
  const removeArrayLonLat = removeArray(removeNullValues);
  // console.log('Objecten met LonLat: ', removeArrayLonLat)

  // //make array of the long lat of every object
  // const geoArray = createLongLatArray(removeArrayLonLat)
  // console.log(JSON.stringify(geoArray))


  //Get disabled Data
  const disabledArray = filterDisabled(RDWData, selectedColumn)
  // console.log(disabledArray)

  const removeArrayDisabled = removeArray(disabledArray)
  // console.log('disabledArray: ', removeArrayDisabled)

  // const removeObjectsDisabled = removeObjects(removeArrayDisabled)
  // console.log(removeObjectsDisabled)

  //Calls the function that replaces undefined for {} so i can add and id to the object
  const objectArray = addObjectUndef(removeArrays)
  // console.log(objectArray)

  //adds id's to the lonlat data objects so I can combine it with the other data variable
  const addIdToLonLat = addIds(objectArray)
  // console.log(addIdToLonLat)

  //adds id's to the disabled data objects so I can combine it with the other data variable
  const addIdToDisabled = addIds(removeArrayDisabled)
  // console.log('DisabledArray ', addIdToDisabled)


const combineJSON = addIdToLonLat.map((item) => {
  // console.log('dit is t item: ', item)
  return{
    ...item,
    ...addIdToDisabled.filter(data => data.id === item.id)[0]
    //https://flaviocopes.com/how-to-merge-objects-javascript/
  }
})

  // console.log("volledige JSON: ", combineJSON)

  //and than as last we filter out the not usable parking spots
  const filterUselessData = filterData(combineJSON)
  // console.log(JSON.stringify(filterUselessData))

})

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
.center([6, 52])                // GPS of location to zoom on
.scale(5000)                    // This is like the zoom
const pathGenerator = d3.geoPath().projection(projection)
//geoPath: this will convert the data path into an svg path string that we can use on svg paths
//geoMercator: this is the type of projection type

const g = svg.append('g')



//ZOOMEN 
svg.call(d3.zoom()
  .on("zoom", zoomed));

function zoomed({transform}) {
g.attr("transform", transform);
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
    .attr('class', 'parkSpots')
    .attr('cx', d => projection([d.accessPointLocation[0].longitude, d.accessPointLocation[0].latitude])[0])
    .attr('cy', d => projection([d.accessPointLocation[0].longitude, d.accessPointLocation[0].latitude])[1])
    .attr('r', '2px')
    })



//-----------------------------------------
//----PLOTTING THE LON LAT ON THE MAP------
//-----------------------------------------


