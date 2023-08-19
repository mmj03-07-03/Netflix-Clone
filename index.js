// Consts
const apiKey = "35a13243cc51617756240cd4b86cae9d";
const apiEndpoint = "https://api.themoviedb.org/3";
const googleAPIKey = "AIzaSyCaY7PScmZbvBSp2AHOCsHOiVdtG33jh3g";
const googleAPIEndpoint = "https://www.googleapis.com/youtube/v3/search?part=snippet";
const imgPath = "https://image.tmdb.org/t/p/original";

const apiPaths = {
    fetchAllCategories: `${apiEndpoint}/genre/movie/list?api_key=${apiKey}`,
    fetchMoviesList: (id) => `${apiEndpoint}/discover/movie?api_key=${apiKey}&with_genres=${id}`,
    trendingMovies: `${apiEndpoint}/trending/movie/week?api_key=${apiKey}`,
    topHindiMovies: `${apiEndpoint}/discover/movie?api_key=${apiKey}&with_original_language=hi`,
    searchOnYoutube: (query) => `${googleAPIEndpoint}&q=${query}&key=${googleAPIKey}`
};

const searchMovieTrailer = (movieName, movieIframeId) => {
    if (!movieName) return;

    const res = fetch(apiPaths.searchOnYoutube(movieName + ' trailer'))
 
    res
        .then(res => res.json())
        .then(res => {
            const trailerId = res.items[0].id.videoId;
            console.log(trailerId);
            const youtubeURL = `https://www.youtube.com/embed/${trailerId}`;
            const iframe = document.getElementById(movieIframeId);
            console.log(iframe);
            iframe.src = youtubeURL;
        })
        .catch(error => console.error("error due to :" + error));

}

const buildMoviesSection = (list, categoryName) => {
    // console.log(list[0]);
    const moviesContainer = document.querySelector('.movies_section');

    const moviesListHTML = list.map(movieObj => {
        return `
            <div class="movie_item">
                <iframe class="movie_iframe" width="241" id="yt${movieObj.id}" onmouseover="searchMovieTrailer('${movieObj.title}', 'yt${movieObj.id}')"></iframe>
                <img src="${imgPath}/${movieObj.backdrop_path}" alt="${movieObj.title}" class="movie_img"></img>            
            </div>
        `;
    }).join('');
    // https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1
    const moviesSectionHTML = ` 
        <div class="movies_container">
            <h3 class="movies_category_heading">${categoryName}<span class="explore_all">Explore All</span></h3>
            <div class="movies_list">
                ${moviesListHTML}
            </div>       
        </div>
    `;

    const div = document.createElement('div');
    div.className = "movies_container";
    div.innerHTML = moviesSectionHTML;

    moviesContainer.append(div);
};

const fetchAndBuildMovieSection = (fetchURL, categoryName) => {
    const res = fetch(fetchURL);
    return res
        .then(res => res.json())
        .then(res => {
            const movies = res.results;
            if (Array.isArray(movies) && movies.length) {
                buildMoviesSection(movies, categoryName);
            }
            return movies;
        })
        .catch(error => console.error(error));
};

const fetchAndBuildAllSections = () => {
    const response = fetch(apiPaths.fetchAllCategories);
    response
        .then(response => response.json())
        .then(response => {
            const categories = response.genres;
            if (Array.isArray(categories) && categories.length) {
                categories.slice(0,2).forEach(category => {
                    fetchAndBuildMovieSection(apiPaths.fetchMoviesList(category.id), category.name);
                });
            }
        })
        .catch(error => console.error(error));
};

const buildBannerSection = (movie) => {
    const bannerSection = document.querySelector('.banner_section');
    const bannerContainer = document.createElement('div');
    bannerContainer.classList.add('banner');
    bannerContainer.style.backgroundImage = `url('${imgPath}${movie.backdrop_path}')`;
    bannerContainer.innerHTML = `
        <div class="banner_container container">
            <h2 class="banner_heading">${movie.title}</h2>
            <p class="banner_info">Trending in movies | Released - ${movie.release_date}</p>
            <p class="banner_overview">${movie.overview}</p>
            <div class="action_buttons">
                <button class="play action_button"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="Hawkins-Icon Hawkins-Icon-Standard"><path d="M4 2.69127C4 1.93067 4.81547 1.44851 5.48192 1.81506L22.4069 11.1238C23.0977 11.5037 23.0977 12.4963 22.4069 12.8762L5.48192 22.1849C4.81546 22.5515 4 22.0693 4 21.3087V2.69127Z" fill="currentColor"></path></svg>Play</button>
                <button class="more_info action_button"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="Hawkins-Icon Hawkins-Icon-Standard"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM13 10V18H11V10H13ZM12 8.5C12.8284 8.5 13.5 7.82843 13.5 7C13.5 6.17157 12.8284 5.5 12 5.5C11.1716 5.5 10.5 6.17157 10.5 7C10.5 7.82843 11.1716 8.5 12 8.5Z" fill="currentColor"></path></svg>More info</button>
            </div>
            <div class="fadebottom"></div>
        </div>
    `;
    bannerSection.appendChild(bannerContainer);
};

const fetchTrendingMovies = () => {
    const res = fetchAndBuildMovieSection(apiPaths.trendingMovies, 'Trending Now')
        .then(movieList => {
            const randomIndex = Math.floor(Math.random() * movieList.length) - 1;
            buildBannerSection(movieList[randomIndex]);
        })
        .catch(err => console.error(err));
};

// Boots Up the Page
const init = (eventObj) => {
    fetchTrendingMovies();
    fetchAndBuildMovieSection(apiPaths.topHindiMovies, 'Top Hindi Movies');
    fetchAndBuildAllSections();
};

window.addEventListener('load', () => {
    init();
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 5) {
            header.classList.add('black_bg');
        }
        else {
            header.classList.remove('black_bg');
        }
    });
});