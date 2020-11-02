// 1 Haal de RDW data op
// 2 Selecteer de kolom in de dataset die ik wil onderzoeken/visualiseren
// 3 Schoon deze data op
const endpoint = 'https://opendata.rdw.nl/resource/t5pc-eb34.json'
const selectedColumn = 'areamanagerid'
const areaIdColumn = getData;

getData(endpoint).then(RDWData => {
    const result = filterData(RDWData, selectedColumn)
    console.log("all data: ", RDWData)
    console.log("one column data: ", RDWData[0])
    console.log(result)
})

async function getData(url){
    const response = await fetch(url)
    const data = await response.json()
    return data
}

function filterData(dataArray, index) {
    return dataArray.map(item => item[index])
  }