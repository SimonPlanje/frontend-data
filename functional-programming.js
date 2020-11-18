// 1 Haal de RDW data op	3
// 2 Selecteer de kolom in de dataset die ik wil onderzoeken/visualiseren
// 3 Schoon deze data op

const endpoint =
  'https://raw.githubusercontent.com/SharonV33/frontend-data/main/data/parkeergarages_1000.json'
const areaIdColumn = getData
const selectedColumn = 'parkingFacilityInformation'

async function getData(url) {
  const response = await fetch(url)
  const data = await response.json()

  return data
}

getData(endpoint).then((RDWData) => {
  //get data all data
  const allData = filterAccesspoint(RDWData, selectedColumn)

  // removes all the arrays around the objects
  const removeArrays = removeArray(allData)

  //replace undifined values with null
  const emptyFixed = fixEmptyKeys(removeArrays)

  //filter out the long lat
  const longLatArray = getLocationArray(emptyFixed)

  //Alle null waardes weghalen
  const removeNullValues = removeNulls(longLatArray)

  //Weer een een array om object weghalen
  const removeArrayLonLat = removeArray(removeNullValues)

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
    return {
      ...item,
      ...addIdToDisabled.filter((data) => data.id === item.id)[0],
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
function filterData(data) {
  return data.filter((result) => result.accessPointLocation)
}

function addObjectUndef(data) {
  return data.map((result) => {
    if (result == undefined) {
      return (result = {})
    } else {
      return result
    }
  })
}

function addIds(data) {
  return data.map((item, index) => {
    if (index !== undefined) {
      return { ...item, id: index + 1 }
    } else {
      return { id: index + 1 }
    }
    //https://stackoverflow.com/questions/50023291/add-id-to-array-of-objects-javascript
  })
}

function addClassesNone(data) {
  return data.map((item) => {
    // console.log('item', item)
    if (item.chargingPointCapacity == 0 && item.disabledAccess == false) {
      return { ...item, id: 'none' }
    } else {
      return item
    }
  })
}

function addClassesDisabled(data) {
  return data.map((item) => {
    if (item.chargingPointCapacity == 0 && item.disabledAccess == true) {
      return { ...item, id: 'disabled' }
    } else {
      return item
    }
  })
}

function addClassesCharging(data) {
  return data.map((item) => {
    if (item.chargingPointCapacity > 0 && item.disabledAccess == false) {
      return { ...item, id: 'charging' }
    } else {
      return item
    }
  })
}

function addClassesBoth(data) {
  return data.map((item) => {
    // console.log('item', item)
    if (item.chargingPointCapacity > 0 && item.disabledAccess == true) {
      return { ...item, id: 'both' }
    } else {
      return item
    }
  })
}

//get disbaled data
function filterDisabled(dataArray, index) {
  return dataArray.map((item) => item[index].specifications)
}

// function removeObjects(data){
//   return data.filter(result => result.chargingPointCapacity !== undefined);
// }

function filterAccesspoint(dataArray, index) {
  return dataArray.map((item) => item[index].accessPoints)
}

function getLocationArray(data) {
  return data.map((item) => item.accessPointLocation)
}

function removeArray(data) {
  return data.map((result) => result[0])
}

function removeNulls(data) {
  return data.filter((result) => result !== null)
}

// function createLongLatArray(data){
//     let lat = data.map(result => result.latitude )
//     let long = data.map(result => result.longitude)
//     return lat.map((latitude, index) =>{
//         return [latitude, long[index]]})
// }

function fixEmptyKeys(data) {
  // Create an object with all the keys in it
  // This will return one object containing all keys the items
  let obj = data.reduce((res, item) => ({ ...res, ...item }))

  // Get those keys as an array
  let keys = Object.keys(obj)

  // Create an object with all keys set to the default value null
  let def = keys.reduce((result, key) => {
    result[key] = null
    return result
  }, {})

  // Use object destrucuring to replace all default values with the ones we have
  return data.map((item) => ({ ...def, ...item }))
  //source: https://stackoverflow.com/questions/47870887/how-to-fill-in-missing-keys-in-an-array-of-objects/47871014#47871014?newreg=7adc7a5e48b7436d99619b4aad68d8f8
}
