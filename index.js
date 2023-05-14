const PAGE_SIZE = 10
const INITIAL_PAGE = 1


const updatePaginationButtons = (currentPage, numPages) => {
    $('#paginationContainer').empty()

    if (currentPage != INITIAL_PAGE) {
        $('#paginationContainer').append(`
     <button id="prev" class="btn btn-primary numberedButtons" value="${currentPage - 1}">Prev</button>
    `);
    }


    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        if (i > 0 && i <= numPages) {
            if (i == currentPage) {
                $('#paginationContainer').append(`
            <button class="btn btn-primary page ms-1 numberedButtons active" value="${i}">${i}</button>
            `);
            } else {
                $('#paginationContainer').append(`
            <button class="btn btn-primary page ms-1 numberedButtons" value="${i}">${i}</button>
            `);
            }
        }
    }

    if (currentPage != numPages) {
        $('#paginationContainer').append(`
     <button id="prev" class="btn btn-primary numberedButtons" value="${currentPage + 1}">Next</button>
    `);
    }

}


const updateHeader = (currentAmount, maxAmount, totalPokemon) => {
    $('#pokeCardsHeader').html(`
     <h3>Showing (${currentAmount} to ${maxAmount}) of ${totalPokemon} pokemon</h3>
    `);
}


const updateFilter = (allFilters) => {
    $('#filterContainer').empty();

    allFilters.forEach((typeObject) => {
        let type = typeObject.name;
        $('#filterContainer').append(`
        <div class="filterDisplay">
            <input id="${type}" class="typeFilter" type="checkbox" name="${type}" value="${type}">
            <label for="${type}">${type}</label>
        </div>
        `);
        console.log(type)
    })
}


const paginate = async (currentPage, allPokemon) => {
    let pagePokemon = allPokemon.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    let totalPokemonOnPage = pagePokemon.length
    let firstPokemonCount = (currentPage - 1) * PAGE_SIZE + 1

    $('#pokeCardContainer').empty();

    updateHeader(firstPokemonCount, totalPokemonOnPage + firstPokemonCount, allPokemon.length)

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


const setup = async () => {
    let allPokemonResponse = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810')
    let allPokemon = allPokemonResponse.data.results
    const numPages = Math.ceil(allPokemon.length / PAGE_SIZE)

    let allFiltersResponse = await axios.get('https://pokeapi.co/api/v2/type/')
    let allFilters = allFiltersResponse.data.results

    updateFilter(allFilters)
    paginate(INITIAL_PAGE, allPokemon)
    updatePaginationButtons(INITIAL_PAGE, numPages)

    // Event listener on pagination buttons
    $('body').on('click', '.numberedButtons', async function (event) {
        let currentPage = Number(event.target.value)
        paginate(currentPage, allPokemon)
        updatePaginationButtons(currentPage, numPages)
    })

}


$(document).ready(setup);
