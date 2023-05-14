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
    })
}


const paginate = async (currentPage, allPokemon) => {
    let pagePokemon = allPokemon.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    let totalPokemonOnPage = pagePokemon.length - 1
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


const getPokemonFiltered = async (filters) => {
    const firstFilter = filters[0]
    const initialSetResponse = await axios.get(`https://pokeapi.co/api/v2/type/${firstFilter}/`)
    let initialSet = initialSetResponse.data.pokemon
    initialSet = initialSet.map((pokemonObject) => {
        return pokemonObject.pokemon
    })

    let pokemonPromises = initialSet.map(async (pokemonObject) => {
        return await axios.get(pokemonObject.url)
    })

    let pokemonPromisesResolved = await Promise.all(pokemonPromises)
    let pokemonArray = pokemonPromisesResolved.map((res) => {
        return res.data
    })

    let initialSetTypes = pokemonArray.map((pokemonObject) => {
        return pokemonObject.types
    })

    let initialSetTypesNames = initialSetTypes.map((typeArray) => {
        let typeArrayNames = typeArray.map((typeObject) => {
            return typeObject.type.name
        })
        return typeArrayNames
    })

    // console.log("Initial Set")
    // console.log(initialSet)
    // console.log("Pokemon")
    // console.log(pokemonArray)
    // console.log("Types")
    // console.log(initialSetTypes)
    // console.log("Types names only")
    // console.log(initialSetTypesNames)

    let initialSetComplete = []

    for (let i = 0; i < initialSet.length; i++) {
        initialSetComplete.push({
            name: initialSet[i],
            type: initialSetTypesNames[i]
        })
    }

    // console.log("Completed set")
    // console.log(initialSetComplete)
    // console.log(initialSetComplete[0].type)

    let multiFilter = initialSetComplete

    for (let i = 1; i < filters.length; i++) {
        console.log(i)
        multiFilter = initialSetComplete.filter((pokemon) => {
            return pokemon.type.includes(filters[i])
        })
    }

    console.log("Multi filter")
    console.log(multiFilter)

    multiFilter = multiFilter.map((typedPokemon) => {
        return typedPokemon.name
    })

    console.log("Multi filter parsed")
    console.log(multiFilter)

    return multiFilter
}


const displayFilteredPokemon = async (filters, allPokemon, numPages) => {
    let filteredPokemon;
    if (filters.length === 0) {
        paginate(INITIAL_PAGE, allPokemon)
        updatePaginationButtons(INITIAL_PAGE, numPages)
    } else {
        console.log("All Pokemon Format")
        console.log(allPokemon)
        filteredPokemon = await getPokemonFiltered(filters)
        paginate(INITIAL_PAGE, filteredPokemon)
        updatePaginationButtons(INITIAL_PAGE, numPages)
    }
}


const updateModal = (pokemonObject) => {
    const name = pokemonObject.species.name.toUpperCase()
    const id = pokemonObject.id
    const imageSrc = pokemonObject.sprites.other['official-artwork'].front_default
    let abilities = pokemonObject.abilities
    let stats = pokemonObject.stats
    let types = pokemonObject.types

    abilities = abilities.map((abilityObject) => {
        return abilityObject.ability.name
    })

    stats = stats.map((statObject) => {
        return {
            name: statObject.stat.name,
            value: statObject.base_stat
        }
    })

    types = types.map((typeObject) => {
        return typeObject.type.name
    })

    console.log(pokemonObject)
    // console.log(name)
    // console.log(abilities)
    // console.log(stats)
    // console.log(types)

    $('#pokeModal').html(`
    <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">

                    <div class="modal-title">
                        <h2>${name}</h2>
                        <h5>${id}</h5>
                    </div>

                    <button type="button" class="close btn btn-light px-2 py-0 pb-1 ms-auto" data-bs-dismiss="modal"
                        aria-label="Close">
                        <span aria-hidden="true" class="fw-bold text-secondary">x</span>
                    </button>
                    <br>

                </div>

                <div class="modal-body">
                    <div style="width:200px">
                        <img class="modalImg"
                            src="${imageSrc}"
                            alt="${name.toLowerCase()}">
                        <div>
                            <h3>Abilities</h3>
                            <ul>
                            ${abilities.map(ability => `<li>${ability}</li>`).join('')}
                            </ul>
                        </div>

                        <div>
                            <h3>Stats</h3>
                            <ul>
                            ${stats.map(stat => `<li>${stat.name}: ${stat.value}</li>`).join('')}
                            </ul>

                        </div>

                    </div>
                    <h3>Types</h3>
                    <ul>
                    ${types.map(type => `<li>${type}</li>`).join('')}
                    </ul>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `);

}


const setup = async () => {
    let allPokemonResponse = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810')
    let allPokemon = allPokemonResponse.data.results
    const numPages = Math.ceil(allPokemon.length / PAGE_SIZE)

    let allFiltersResponse = await axios.get('https://pokeapi.co/api/v2/type/')
    let allFilters = allFiltersResponse.data.results
    let selectedFilters = [];

    updateFilter(allFilters)
    paginate(INITIAL_PAGE, allPokemon)
    updatePaginationButtons(INITIAL_PAGE, numPages)

    // Event listener on pagination buttons
    $('body').on('click', '.numberedButtons', async function (event) {
        let currentPage = Number(event.target.value)
        paginate(currentPage, allPokemon)
        updatePaginationButtons(currentPage, numPages)
    })

    // Event listener on filter
    $('body').on('change', '.typeFilter', function (event) {
        let filter = event.target.value
        if ($(this).is(':checked')) {
            selectedFilters.push(filter)
        } else {
            selectedFilters = selectedFilters.filter((element) => {
                return element !== filter
            })
        }

        // console.log(selectedFilters)
        displayFilteredPokemon(selectedFilters, allPokemon, numPages)
    });

    // Event listener on pokemon card
    $('body').on('click', '.pokeCard', async function (event) {
        const pokemonName = $(this).attr('pokeName')
        const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
        const pokemonObject = pokemonResponse.data
        updateModal(pokemonObject)

    });

}


$(document).ready(setup);
