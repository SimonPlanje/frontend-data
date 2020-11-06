
// 1 Haal de RDW data op
// 2 Selecteer de kolom in de dataset die ik wil onderzoeken/visualiseren
// 3 Schoon deze data op

const endpoint = 'https://raw.githubusercontent.com/SharonV33/frontend-data/main/data/parkeergarages_1000.json'
const areaIdColumn = getData;
const selectedColumn = 'parkingFacilityInformation';
const allData = [];
console.log(allData)

getData(endpoint).then(RDWData => {
    const result = filterData(RDWData, selectedColumn)
    
    allData.push(result);
})

async function getData(url){
    const response = await fetch(url)
    const data = await response.json()
    return data
}



function filterData(dataArray, index) {
    return dataArray.map(item => item[index].accessPoints[0].accessPointLocation )
  }

//accessPointLocation returned niks omdat de data een grote object array mess is ^ 😩