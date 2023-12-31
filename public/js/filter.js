emitter.setMaxListeners(20);

const data = {
    "genres": null,
    "type": null,
    "minRunTime": null,
    "maxRunTime": null,
    "rated": null,
    "startYear": null,
    "endYear": null,
    "alreadyWatched": null
};

const moviesData = {
    "filter": [],
    "hits": [],
    "action": [],
    "animation": [],
    "drama": [],
    "sciFan": [],
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
    else if (sId == 'action') {
        movie = moviesData.action[nId];
    }
    else if (sId == 'animation') {
        movie = moviesData.animation[nId];
    }
    else if (sId == 'drama') {
        movie = moviesData.drama[nId];
    }
    else if (sId == 'sciFan') {
        movie = moviesData.sciFan[nId];
    }

    document.getElementById('popupPoster').src = movie.posterLink;
    document.getElementById('popupType').innerText = movie.type;
    document.getElementById('popupTitle').innerText = movie.title;
    document.getElementById('popupYear').innerText = movie.year;
    document.getElementById('popupRated').innerText = movie.rated;
    document.getElementById('popupRuntime').innerText = movie.runtime;

    document.getElementById(`popupGenre0`).innerText = '';
    document.getElementById(`popupGenre1`).innerText = '';
    document.getElementById(`popupGenre2`).innerText = '';

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
    if (index == 7) {
        document.getElementById("question-text").style.display = 'none';
        document.getElementById('result-warp-wrap2').style.display = 'none';
        filterMovies();
    }
    else {
        const questionRes = await fetch('./questions.json');
        const questions = await questionRes.json();
        const question = questions.questions[index];
        console.log(question);
        
        if (index == 6) {
            document.getElementById("question-text").textContent = question.qText;
            values = [];
            const ranNum = [];
            while (ranNum.length < 5) {
                const num = Math.floor(Math.random() * 9);
                if (!ranNum.includes(num)) {
                    ranNum.push(num);
                }
            }
            for (let i = 0; i < 5; i++) {
                const poster = document.getElementById(`posterIMG-${i+1}`);
                const title = document.getElementById(`movieData-${i+1}`);
                document.getElementById('result-warp-wrap2').style.display = 'flex';
                poster.style.display = 'block'
                title.style.display = 'block';

                poster.src = question.choices[ranNum[i]].link;
                title.innerText = question.choices[ranNum[i]].cTitle;

                values[i] = { "value": question.choices[ranNum[i]].value, "alw": question.choices[ranNum[i]].id };
                poster.onclick = function() { nextQA(index, values[i]) };
                title.onclick = function() { nextQA(index, values[i]) };
            }

            const choice = document.getElementById(`choice0`);
            choice.style.display = 'block';
            choice.innerText = "I've never seen these movie."
            values[5] = null;
            choice.onclick = function() { nextQA(index, values[5]) };
        }
        else {
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
}

function nextQA(index, value) {
    for (let i = 0; i < 9; i++) {
        document.getElementById(`choice${i}`).style.display = 'none';
    }

    switch(index) {
        case 0:
            data.genres = value;
            startQA(1);
            break;
        case 1:
            data.type = value;
            if (data.type == 'movie' || data.type == null) {
                startQA(2);
            }
            if (data.type == 'tvSeries') {
                startQA(3);
            }
            break;
        case 2:
            data.minRunTime = value[0];
            data.maxRunTime = value[1];
            startQA(4);
            break;
        case 3:
            data.minRunTime = value[0];
            data.maxRunTime = value[1];
            startQA(4);
            break;
        case 4:
            data.rated = value;
            startQA(5);
            break;
        case 5:
            data.startYear = value[0];
            data.endYear = value[1];
            startQA(6);
            break;
        case 6:
            if (value != null && data.genres != null) {
                for (let genre of value.value) {
                    if (!data.genres.includes(genre)) {
                        data.genres.push(genre);
                    }
                }
            }
            else if (data.genres == null) {
                if (value != null) {
                    data.genres = value.value;
                }
            }
            if (value != null) {
                data.alreadyWatched = value.alw;
            }
            startQA(7);
            break;
    }

    console.log(data);
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
    let res = await fetch('/api/loadHits');
    let movies = await res.json();
    console.log(movies);

    for (let i = 0; i < 8; i++) {
        moviesData.hits = movies.hits;
        document.getElementById(`posterHits${i}`).src = moviesData.hits[i].posterLink;
        document.getElementById(`hitsTitle${i}`).innerText = moviesData.hits[i].title;
    }

    res = await fetch('/api/loadAction');
    movies = await res.json();
    console.log(movies);

    for (let i = 0; i < 8; i++) {
        moviesData.action = movies.Action;
        document.getElementById(`posterAction${i}`).src = moviesData.action[i].posterLink;
        document.getElementById(`actionTitle${i}`).innerText = moviesData.action[i].title;
    }

    res = await fetch('/api/loadAnimation');
    movies = await res.json();
    console.log(movies);

    for (let i = 0; i < 8; i++) {
        moviesData.animation = movies.Animation;
        document.getElementById(`posterAnimation${i}`).src = moviesData.animation[i].posterLink;
        document.getElementById(`animationTitle${i}`).innerText = moviesData.animation[i].title;
    }

    res = await fetch('/api/loadDrama');
    movies = await res.json();
    console.log(movies);

    for (let i = 0; i < 8; i++) {
        moviesData.drama = movies.Drama;
        document.getElementById(`posterDrama${i}`).src = moviesData.drama[i].posterLink;
        document.getElementById(`dramaTitle${i}`).innerText = moviesData.drama[i].title;
    }

    res = await fetch('/api/loadSciFan');
    movies = await res.json();
    console.log(movies);

    for (let i = 0; i < 8; i++) {
        moviesData.sciFan = movies.SciFan;
        document.getElementById(`posterSci-fan${i}`).src = moviesData.sciFan[i].posterLink;
        document.getElementById(`sci-fanTitle${i}`).innerText = moviesData.sciFan[i].title;
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
    if (results.Response == "False") {
        document.getElementById('searchSuccess').style.display = 'none';
        document.getElementById('searchFail').style.display = 'block';
        document.getElementById('keywordFail').innerText = `"${keyword}"`;
    }
    moviesData.search = results;
    let last = 0;
    for (let i = 0; i < results.length - 1; i++) {
        if (results[i].posterLink == "N/A") {
            document.getElementById(`posterSearch${i}`).src = "img/notfound_placeholder.svg";
        }
        else {
            document.getElementById(`posterSearch${i}`).src = results[i].posterLink;
        }
        document.getElementById(`SearchTitle${i}`).innerText = results[i].title;
        last = i;
    }
    for (let i = last + 1; i < 9; i++) {
        document.getElementById(`posterSearch${i}`).style.display = 'none';
        document.getElementById(`SearchTitle${i}`).style.display = 'none';
    }
}