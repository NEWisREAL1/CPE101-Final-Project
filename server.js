const express = require('express');
const fs = require('fs');
require('dotenv').config();
const bodyParser = require('body-parser');
const app = express();

app.use(express.json()); // Middleware for parsing JSON in request body
app.use(bodyParser.urlencoded({ extended: true }));

const key = process.env.API_KEY;

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
    const movieList = [];

    for (let i = 0; i < data.movies.length; i++) {
      let legitMovie = 1;
      const movie = data.movies[i];

      // -------- Filtering -------- //

      // --- Movie / Series Filter ---//
      if (filters.type != movie.type) {
        legitMovie = 0;
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
      const langs = omdbInfo.Language.split(", ");
      if (omdbInfo) {
        
        // --- Lang filter --- //
        if (legitMovie) {
          if (langs.includes('none')) {
            legitMovie = 0;
          }
          else if (filters.language) {
            if (!langs.includes(filters.language)) {
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


      if (legitMovie) {
        movie.language = langs;
        movie.runtime = `${runtime} min`;
        movie.rated = omdbInfo.Rated;
        movie.plot = omdbInfo.Plot;
        movie.posterLink = omdbInfo.Poster;
        movie.ratings = omdbInfo.Ratings;
        movie.meta = omdbInfo.Metascore;
        movie.imdbVotes = omdbInfo.imdbVotes;
        movieList.push(movie);
        console.log(`Movie founded, count ${movieList.length}`);
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

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening at ${PORT}...`));
app.use(express.static('public'));