const data = {
    "genres": null,
    "type": null,
    "minRunTime": null,
    "maxRunTime": null,
    "language": null,
    "startYear": null,
    "endYear": null
};

let values = [];

async function startQA(index) {
    if (index == 5) {
        filterMovies();
    }
    else {
        const questionRes = await fetch('./questions.json');
        const questions = await questionRes.json();
        const question = questions.questions[index];
        console.log(question);
    
        document.getElementById("start").style.display = 'none';
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
        for (let i = 0; i < movies.length; i++) {
            document.getElementById('statusBox').innerText = '';
            document.getElementById(`PosterIMG${i}`).src = movies[i].posterLink;
            document.getElementById(`dataField${i}`).innerText = movies[i].title;
        }
    }

    console.log(movies);
}