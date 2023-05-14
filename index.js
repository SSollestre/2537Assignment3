const setup = async () => {
    let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810')
    console.log(response.data.results)
}


$(document).ready(setup);
