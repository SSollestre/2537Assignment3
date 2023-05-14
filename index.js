const PAGE_SIZE = 10
let currentPage = 1


const setup = async () => {
    let allPokemonResponse = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810')
    let allPokemon = allPokemonResponse.data.results

    let pagePokemon = allPokemon.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    pagePokemon.forEach(async (pokemonObject) => {
        let pokemonResponse = await axios.get(pokemonObject.url)
        let pokemon = pokemonResponse.data
        let pokemonName = pokemon.name
        let pokemonHeader = pokemonName.toUpperCase()
        let pokemonImage = pokemon.sprites.front_default
        $('#pokeCardContainer').append(`
            <div class="pokeCard card" pokeName=${pokemonName}>
            <h3>${pokemonHeader}</h3>
            <img src="${pokemonImage}" alt="${pokemonName}">
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#pokeModal">More</button>
        </div>
    `);
    })

}


$(document).ready(setup);
