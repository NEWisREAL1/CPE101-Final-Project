const data = {
    "genres": null,
    "type": null,
    "minRunTime": null,
    "maxRunTime": null,
    "language": null,
    "startYear": null,
    "endYear": null
};

const moviesData = {
    "filter": [],
    "hits": [],
    "action": [],
    "search": []
}

function loadPopupData(id) {
    const sId = id.slice(0,-1);
    const nId = parseInt(id.slice(-1));
    console.log(sId, nId);

    let movie;
    if (sId == 'filter') {
        movie = moviesData.filter[nId];
    }
    else if (sId == 'hits') {
        movie = moviesData.hits[nId];
    }
    else if (sId == 'search') {
        movie = moviesData.search[nId];
    }

    document.getElementById('popupPoster').src = movie.posterLink;
        document.getElementById('popupType').innerText = movie.type;
        document.getElementById('popupTitle').innerText = movie.title;
        document.getElementById('popupYear').innerText = movie.year;
        document.getElementById('popupRated').innerText = movie.rated;
        document.getElementById('popupRuntime').innerText = movie.runtime;

        if (typeof(movie.genres) == 'string') {
            document.getElementById('popupGenre0').innerText = movie.genres;
        }
        else {
            for (let i = 0; i < movie.genres.length; i++) {
                if (i == movie.genres.length - 1) {
                    document.getElementById(`popupGenre${i}`).innerText = movie.genres[i];
                }
                else {
                    document.getElementById(`popupGenre${i}`).innerText = movie.genres[i] + ' •';
                }
            }
        }
        
        document.getElementById('popupPlot').innerText = movie.plot;
        if (movie.ratings.length >= 1) {
            document.getElementById('popupImdbRate').innerText = movie.ratings[0].Value;
        }
        else {
            document.getElementById('popupImdbRate').innerText = 'unavailable';
        }
        if (movie.ratings.length >= 2) {
            document.getElementById('popupTomatoRate').innerText = movie.ratings[1].Value;
        }
        else {
            document.getElementById('popupTomatoRate').innerText = 'unavailable';
        }
        document.getElementById('popupMeta').innerText = movie.meta;
}

let values = [];

async function startQA(index) {
    document.getElementById('hero').style.display = 'none';
    document.getElementById('questioning').style.display = 'block';
    if (index == 5) {
        document.getElementById("question-text").style.display = 'none';
        filterMovies();
    }
    else {
        const questionRes = await fetch('./questions.json');
        const questions = await questionRes.json();
        const question = questions.questions[index];
        console.log(question);
    
        //document.getElementById("start").style.display = 'none';
        document.getElementById("question-text").textContent = question.qText;
        values = [];
        for (let i = 0; i < question.choices.length; i++) {
            const choice = document.getElementById(`choice${i}`);
            choice.style.display = 'block';
            choice.textContent = question.choices[i].cText;
            values[i] = question.choices[i].value;
            choice.onclick = function() { nextQA(index, values[i]) };
        }
    }
}

function nextQA(index, value) {
    for (let i = 0; i < 9; i++) {
        document.getElementById(`choice${i}`).style.display = 'none';
    }

    switch(index) {
        case 0:
            data.genres = value;
            break;
        case 1:
            data.type = value;
            break;
        case 2:
            data.minRunTime = value[0];
            data.maxRunTime = value[1];
            break;
        case 3:
            data.language = value;
            break;
        case 4:
            data.startYear = value[0];
            data.endYear = value[1];
            break;
    }

    console.log(data);
    startQA(index + 1);
}

async function filterMovies() {
    document.getElementById('statusBox').innerText = 'Filtering Movies...'
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    const res = await fetch('/api/filter', options);
    const movies = await res.json();
    if (!movies.length) {
        document.getElementById('statusBox').innerText = 'Filtering ERROR!!!'
    }
    else {
        document.getElementById('statusBox').innerText = 'Your Results';
        document.getElementById('result-warp-wrap').style.display = 'flex';
        for (let i = 0; i < movies.length; i++) {
            document.getElementById(`posterIMG${i}`).src = movies[i].posterLink;
            document.getElementById(`movieData${i}`).innerText = movies[i].title;
        }
    }
    moviesData.filter = movies;
    console.log(movies);
}

async function loadMovies() {
    console.log("LOADING MOVIES");
    const res = await fetch('/api/loadMovies');
    const movies = await res.json();
    console.log(movies);

    for (let i = 0; i < 8; i++) {
        moviesData.hits = movies.hits;
        document.getElementById(`posterHits${i}`).src = movies.hits[i].posterLink;
        document.getElementById(`hitsTitle${i}`).innerText = movies.hits[i].title;
    }
}

function key_down(e) {
    if (e.keyCode == 13) {
        const keyword = document.getElementById('searchbar').value;
        localStorage.setItem('keyword', keyword);
        window.location.replace('search.html');
    }
}

async function searchMovies() {
    const keyword = localStorage.getItem('keyword');
    document.getElementById('keyword').innerText = `"${keyword}"`;
    const res = await fetch(`/api/search/${keyword}`);
    const results = await res.json();
    moviesData.search = results;
    for (let i = 0; i < results.length - 1; i++) {
        document.getElementById(`posterSearch${i}`).src = results[i].posterLink;
        document.getElementById(`SearchTitle${i}`).innerText = results[i].title;
    }
}