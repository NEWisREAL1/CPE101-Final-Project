const express = require('express');
const fs = require('fs');
require('dotenv').config();
const bodyParser = require('body-parser');
const app = express();

app.use(express.json()); // Middleware for parsing JSON in request body
app.use(bodyParser.urlencoded({ extended: true }));

const key = process.env.API_KEY;
//const key = process.env.API_KEY_2;

async function getData() {
  try {
    const data = await fs.promises.readFile('data/data.json', 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    throw err;
  }
}

async function getOMDB(ID) {
  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${ID}&apikey=${key}`);
    const json = await res.json();
    return json;
  } catch (err) {
    throw err;
  }
}

app.get('/api/allMovies', async (req, res) => {
  try {
    const data = await getData();
    console.log('Movies fetched successfully.');
    res.json(data.movies); // Send the data as JSON
  } 
  catch (err) {
    console.log('An error occurred.');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' }); // Set proper status code for error
  }
});

app.post('/api/filter', async (req, res) => {
  try {
    const filters = req.body;
    const data = await getData();
    console.log('Movies database fetched successfully.');
    console.log('Start Filtering data...');
    const movieList = [];

    for (let i = 0; i < data.movies.length; i++) {
      let legitMovie = 1;
      const movie = data.movies[i];

      // -------- Filtering -------- //

      // --- Movie / Series Filter ---//
      if (filters.type) {
        if (filters.type != movie.type) {
          legitMovie = 0;
        }
      }

      // --- Genres Filter --- //
      if (legitMovie) {
        legitMovie = 0
        let genresHave = 0;
        if (filters.genres) {
          for (let genre of filters.genres) {
            if (movie.genres.includes(genre)) {
              genresHave++;
            }
            if (genresHave == parseInt(movie.genres.length / 2) || genresHave == filters.genres.length) {
              legitMovie = 1;
              break;
            }
          }
        }
        else {
          legitMovie = 1;
        }
      }

      // --- Year Filter --- //
      if (legitMovie) {
        if (filters.startYear) {
          if (filters.startYear > movie.year) {
            legitMovie = 0;
          }
        }

        if (filters.endYear) {
          if (filters.endYear < movie.year) {
            legitMovie = 0;
          }
        }
      }

      // ----- OMDb related filters ----- //

      const omdbInfo = await getOMDB(movie.imdbID);
      const runtime = parseInt(omdbInfo.Runtime);
      const rated = omdbInfo.Rated;
      if (omdbInfo) {
        
        // --- Rated filter --- //
        if (legitMovie) {
          if (rated.includes('none')) {
            legitMovie = 0;
          }
          else if (filters.rated) {
            if (!filters.rated.includes(rated)) {
              legitMovie = 0;
            }
          }
        }

        // --- Runtime filter --- //
        if (legitMovie) {
          if (isNaN(runtime)) {
            legitMovie = 0;
          }
          else {
            if (filters.maxRunTime) {
              if (filters.maxRunTime < runtime) {
                legitMovie = 0;
              }
            }
            if (filters.minRunTime) {
              if (filters.minRunTime > runtime) {
                legitMovie = 0;
              }
            }
          } 
        }

      }
      else {
        console.log("OMDb fetch fail.");
      }

      // --- Already Watched Filter --- //
      if (legitMovie) {
        if (filters.alreadyWatched != null) {
          if (filters.alreadyWatched.includes(movie.imdbID)) {
            legitMovie = 0;
          }
        }
      }

      if (legitMovie) {
        movie.language = omdbInfo.Language.split(", ");;
        movie.runtime = `${runtime} min`;
        movie.rated = rated;
        movie.plot = omdbInfo.Plot;
        movie.posterLink = omdbInfo.Poster;
        movie.ratings = omdbInfo.Ratings;
        movie.meta = omdbInfo.Metascore;
        movie.imdbVotes = omdbInfo.imdbVotes;
        movieList.push(movie);
        console.log(`Movie founded, count ${movieList.length}`);
        i += Math.floor(Math.random() * 20);
      }
      else {
        console.log(`not legit ${i}, ${movie.title}`);
      }

      if (movieList.length >= 5) {
        console.log("filtering done.")
        break;
      }
    }

    res.json(movieList);
  } 
  catch (err) {
    console.log('An error occurred.');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/loadHits', async (req, res) => {
  try {
    console.log("Loading Hits...");
    const movieHits = {
      "hits": []
    };
    const data = await getData();
    console.log('Movies database fetched successfully.');

    for (let i = 0; i < data.movies.length; i++) {
      const movie = data.movies[i];

      
      if (parseInt(movie.year) >= 2023) {
        const omdbInfo = await getOMDB(movie.imdbID);
        movie.language = omdbInfo.Language.split(", ");
        const runtime = parseInt(omdbInfo.Runtime);
        movie.runtime = `${runtime} min`;
        movie.rated = omdbInfo.Rated;
        movie.plot = omdbInfo.Plot;
        movie.posterLink = omdbInfo.Poster;
        movie.ratings = omdbInfo.Ratings;
        movie.meta = omdbInfo.Metascore;
        movie.imdbVotes = omdbInfo.imdbVotes;
        movieHits.hits.push(movie);
      }

      let loadDone = movieHits.hits.length >= 8;

      if (loadDone) {
        break;
      }
    }

    res.json(movieHits)
  }
  catch (err) {
    console.log('An error occurred.');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/loadAction', async (req, res) => {
  try {
    console.log("Loading Actions...");
    const movieAction = {
      "Action": []
    };
    const data = await getData();
    console.log('Movies database fetched successfully.');

    for (let i = 0; i < data.movies.length; i++) {
      const movie = data.movies[i];

      
      if (movie.genres.includes('Action')) {
        const omdbInfo = await getOMDB(movie.imdbID);
        movie.language = omdbInfo.Language.split(", ");
        const runtime = parseInt(omdbInfo.Runtime);
        movie.runtime = `${runtime} min`;
        movie.rated = omdbInfo.Rated;
        movie.plot = omdbInfo.Plot;
        movie.posterLink = omdbInfo.Poster;
        movie.ratings = omdbInfo.Ratings;
        movie.meta = omdbInfo.Metascore;
        movie.imdbVotes = omdbInfo.imdbVotes;
        movieAction.Action.push(movie);
      }

      let loadDone = movieAction.Action.length >= 8;

      if (loadDone) {
        break;
      }
    }

    res.json(movieAction);
  }
  catch (err) {
    console.log('An error occurred.');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/loadAnimation', async (req, res) => {
  try {
    console.log("Loading Animations...");
    const movieAnimation = {
      "Animation": []
    };
    const data = await getData();
    console.log('Movies database fetched successfully.');

    for (let i = 0; i < data.movies.length; i++) {
      const movie = data.movies[i];

      
      if (movie.genres.includes('Animation')) {
        const omdbInfo = await getOMDB(movie.imdbID);
        movie.language = omdbInfo.Language.split(", ");
        const runtime = parseInt(omdbInfo.Runtime);
        movie.runtime = `${runtime} min`;
        movie.rated = omdbInfo.Rated;
        movie.plot = omdbInfo.Plot;
        movie.posterLink = omdbInfo.Poster;
        movie.ratings = omdbInfo.Ratings;
        movie.meta = omdbInfo.Metascore;
        movie.imdbVotes = omdbInfo.imdbVotes;
        movieAnimation.Animation.push(movie);
      }

      let loadDone = movieAnimation.Animation.length >= 8;

      if (loadDone) {
        break;
      }
    }

    res.json(movieAnimation);
  }
  catch (err) {
    console.log('An error occurred.');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/loadDrama', async (req, res) => {
  try {
    console.log("Loading Dramas...");
    const movieDrama = {
      "Drama": []
    };
    const data = await getData();
    console.log('Movies database fetched successfully.');

    for (let i = 0; i < data.movies.length; i++) {
      const movie = data.movies[i];

      
      if (movie.genres.includes('Drama')) {
        const omdbInfo = await getOMDB(movie.imdbID);
        movie.language = omdbInfo.Language.split(", ");
        const runtime = parseInt(omdbInfo.Runtime);
        movie.runtime = `${runtime} min`;
        movie.rated = omdbInfo.Rated;
        movie.plot = omdbInfo.Plot;
        movie.posterLink = omdbInfo.Poster;
        movie.ratings = omdbInfo.Ratings;
        movie.meta = omdbInfo.Metascore;
        movie.imdbVotes = omdbInfo.imdbVotes;
        movieDrama.Drama.push(movie);
      }

      let loadDone = movieDrama.Drama.length >= 8;

      if (loadDone) {
        break;
      }
    }

    res.json(movieDrama);
  }
  catch (err) {
    console.log('An error occurred.');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/loadSciFan', async (req, res) => {
  try {
    console.log("Loading Sci-Fan...");
    const movieSciFan = {
      "SciFan": []
    };
    const data = await getData();
    console.log('Movies database fetched successfully.');

    for (let i = 0; i < data.movies.length; i++) {
      const movie = data.movies[i];

      
      if (movie.genres.includes('Sci-Fi') || movie.genres.includes('Fantasy')) {
        const omdbInfo = await getOMDB(movie.imdbID);
        movie.language = omdbInfo.Language.split(", ");
        const runtime = parseInt(omdbInfo.Runtime);
        movie.runtime = `${runtime} min`;
        movie.rated = omdbInfo.Rated;
        movie.plot = omdbInfo.Plot;
        movie.posterLink = omdbInfo.Poster;
        movie.ratings = omdbInfo.Ratings;
        movie.meta = omdbInfo.Metascore;
        movie.imdbVotes = omdbInfo.imdbVotes;
        movieSciFan.SciFan.push(movie);
      }

      let loadDone = movieSciFan.SciFan.length >= 8;

      if (loadDone) {
        break;
      }
    }

    res.json(movieSciFan);
  }
  catch (err) {
    console.log('An error occurred.');
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/search/:keyword', async (req, res) => {
  try {
    console.log(`fetching in search function... keyword ${req.params.keyword}`);
    const searchRes = await fetch(`https://www.omdbapi.com/?s=${req.params.keyword}&apikey=${key}`);
    const results = await searchRes.json();
    if (results.Response == 'False') {
      console.log("!! Search Response False.");
      res.json(results);
    }
    else {
      const resultsData = [];
      for (let result of results.Search) {
        const omdbInfo = await getOMDB(result.imdbID);
        const movie = {};
  
        const runtime = parseInt(omdbInfo.Runtime);
        movie.runtime = `${runtime} min`;
  
        movie.title = omdbInfo.Title;
        movie.year = omdbInfo.Year;
        movie.type = omdbInfo.Type;
        movie.genres = omdbInfo.Genre.split(", ")
        movie.language = omdbInfo.Language.split(", ");
        movie.rated = omdbInfo.Rated;
        movie.plot = omdbInfo.Plot;
        movie.posterLink = omdbInfo.Poster;
        movie.ratings = omdbInfo.Ratings;
        movie.meta = omdbInfo.Metascore;
        movie.imdbVotes = omdbInfo.imdbVotes;
        resultsData.push(movie);
      }
      res.json(resultsData)
    }
  }
  catch (err) {
    console.log('An error occurred.');
    console.error(err);
    //res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening at ${PORT}...`));
app.use(express.static('public'));