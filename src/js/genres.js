import refs from './refs';
// import { Languages } from './lang-switcher';
import { transformDate, transformGenre } from './changeDateAndGenres';
import genresTemplate from '../templates/genres.hbs';
import mainGalleryTpl from '../templates/main-gallery.hbs';
import oopsTpl from '../templates/oops.hbs';
import filmoteka from './ApiService';
import { renderPopularMovies } from './movies-gallery';
import { startPagination } from './pagination';

addGenresListeners();

async function addGenresListeners() {
  await renderGenreButtons();

  const genreBtnList = document.querySelector('.genre-button-list');
  const allGenresBtn = document.getElementById('li-genre-all');

  genreBtnList.addEventListener('click', onGenreButtonClick);
  allGenresBtn.addEventListener('click', onAllGenresBtnClick);
}

async function renderGenreButtons() {
  const genres = await filmoteka.fetchGenres();
  const markup = genresTemplate(genres);
  refs.genresContainer.classList.remove('visually-hidden');
  refs.genresContainer.insertAdjacentHTML('beforeend', markup);
}

async function onAllGenresBtnClick(e) {
  // console.log(e.target);
  if (e.target.classList.contains('js-genre-all-label')) {
    filmoteka.resetPage();
    renderPopularMovies();
  }
}

async function onGenreButtonClick(e) {
  // e.target.classList.toggle('checked');
  if (e !== undefined) {
    if (e.target.nodeName !== 'LABEL') return;
    filmoteka.genreId = e.target.dataset.id;
    filmoteka.resetPage();
  }

  const { page, results, total_pages, total_results } = await filmoteka.fetchMoviesByGenre();
  // console.log({ results });

  if (results.length === 0) {
    // onHideBtnClick();
    clearContainer(refs.movieContainer);
    renderMarkup(refs.movieContainer, oopsTpl);
    // refs.paginationContainer.style.display = 'none';
    return;
  }

  const genresObj = await filmoteka.fetchGenres();
  const genresList = [...genresObj];
  // console.log(genresList);

  transformDate(results);
  transformGenre(results, genresList);

  if (total_pages <= 1) {
    refs.paginationContainer.style.display = 'none';
  } else {
    filmoteka.setTotalPages(total_pages);
    startPagination(onGenreButtonClick);

    refs.paginationContainer.style.display = 'block';
  }

  refs.movieContainer.innerHTML = mainGalleryTpl(results);
}

// полезные функции
function renderMarkup(nameContainer, fnTemplates) {
  nameContainer.insertAdjacentHTML('beforeend', fnTemplates());
}

function clearContainer(nameContainer) {
  nameContainer.innerHTML = '';
}
