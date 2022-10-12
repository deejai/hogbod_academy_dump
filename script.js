
var next_id = 1;

var searching_for_movie = false;
var found_movies = null;

var ascending_sort = true;

class Movie {
    id;
    title;
    rating;
    year;
    poster_src;
    description;
    user_rating;

    constructor() {
        this.id = next_id;
        next_id += 1;
    }
}

var header_keys = {
    "Title": "title",
    "My Rating": "rating",
    "User Rating": "user_rating",
    "Year": "year"
}

var movie = new Movie();

var movie_list = [];

let movie_table = document.querySelector("#content table tbody");

function saveMovies() {
    fetch("http://localhost:5001", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "movies": movie_list })
    })
        .then(function (data) {
            console.log(data);
        });
}

function loadMovies() {
    fetch("http://localhost:5001")
        .then(function (response) {
            response.json().then(function (data) {
                console.log(data);
                movie_list = data.movies;
                updateTable();
                let highest_id = -1;
                for (let movie of movie_list) {
                    if (movie.id > highest_id) {
                        highest_id = movie.id;
                    }
                }
                next_id = highest_id + 1;
            })
        });
}

function getRowText(movie) {
    let rowText = `<tr title="${movie.description}">`
    rowText += `<td><img width="50" height="50" src=http://image.tmdb.org/t/p/w500/${movie.poster_src}></img></td>`;
    rowText += `<td>${movie.title}</td>`;
    rowText += `<td>${movie.rating}/10</td>`;
    rowText += `<td>${movie.user_rating}/10</td>`;
    rowText += `<td>${movie.year}</td>`;
    rowText += "</tr>"
    return rowText;
}

function addMovie() {
    let title_query = prompt("What is the movie title?");
    let rating = prompt("What would you rate it out of 10 stars?");

    searchMovies(title_query);

    let interval_id = setInterval(function () {
        if (searching_for_movie == false) {
            let search_result = found_movies;
            console.log(search_result);
            if (search_result.results.length == 0) {
                return;
            }

            let result = search_result.results[0];

            let new_movie = new Movie();
            new_movie.title = result.title;
            new_movie.rating = rating;
            new_movie.year = result.release_date.substr(0, 4)
            new_movie.poster_src = result.poster_path;
            new_movie.description = result.overview;
            new_movie.user_rating = result.vote_average;

            movie_list.push(new_movie);

            updateTable();
            clearInterval(interval_id);
        }
        else {
            console.log("Searching...");
        }
    }, 50)

    // let rating_number = parseInt(rating);
    // if (rating_number > 10 || rating_number < 0) {
    //     alert("Invalid rating");
    //     return;
    // }

    // if (title == null || year == null || rating == null) {
    //     return;
    // }

    // let movie = new Movie(title, rating, year);
    // movie_list.push(movie);

    // updateTable();
}

function compare(movie_a, movie_b, sort_by) {
    if (movie_a[sort_by] < movie_b[sort_by]) {
        return -1;
    }
    if (movie_a[sort_by] > movie_b[sort_by]) {
        return 1;
    }

    return 0;
}

function updateTable(sort_by = null) {
    movie_table.innerHTML = "<tr><th></th><th>Title</th><th>My Rating</th><th>User Rating</th><th>Year</th></tr>";

    let movie_list_sorted;

    if (sort_by == null) {
        movie_list_sorted = movie_list;
    }
    else {
        movie_list_sorted = Array.from(movie_list);
        movie_list_sorted.sort(function(a, b) {
            if(ascending_sort) {
                return compare(a, b, sort_by);
            }
            else {
                return -compare(a, b, sort_by);
            }
        });

        ascending_sort = !ascending_sort;
    }

    for (let i = 0; i < movie_list_sorted.length; i++) {
        let movie = movie_list_sorted[i];
        let rowText = getRowText(movie);
        movie_table.innerHTML += rowText;
    }
}

function searchMovies(query) {
    if (searching_for_movie == true) {
        return;
    }

    searching_for_movie = true;

    let query_string = "https://api.themoviedb.org/3/search/movie";
    query_string += "?api_key=2b3b98370b368dbbb96e8fba7556f02f";
    query_string += "&query=" + query.replace(" ", "%20");
    fetch(query_string)
        .then(function (response) {
            response.json().then(function (data) {
                // console.log(data);
                found_movies = data;
                searching_for_movie = false;
            })
        })
        .catch(function (error) {
            console.log(error);
        });
}

movie_table.addEventListener("click", function (event) {
    let cell = event.target;
    if (cell.tagName == "TH") {
        let sort_by = cell.textContent;
        sort_by = header_keys[sort_by];
        console.log("sort by: " + sort_by);
        updateTable(sort_by);
    }

    console.log(event.target);
    console.log(event.target.parentNode);
})

loadMovies();
