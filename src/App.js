import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import useDebounce from "./useDebounce";
const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "74445f5e";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [Rating, setRating] = useState(0);
  // const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  // const avgUserRating = average(watched.map((movie) => movie.userRating));
  // const avgRuntime = average(watched.map((movie) => movie.runtime));
  // https://www.omdbapi.com/?apikey=${KEY}&s=${query}
  function handleSelectMovie(id) {
    setSelectedId(id);
  }
  function handleCloseSelectMovie() {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  const debouncedQuery = useDebounce(query, 500);
  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&s=${debouncedQuery}`
        );
        if (!res.ok) {
          throw new Error("Something went wrong");
        }
        const data = await res.json();
        if (data.Response === "False") {
          throw new Error(data.Error);
        }
        setMovies(data.Search);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    query.length >= 2 ? fetchMovies() : setMovies([]);
  }, [debouncedQuery]);
  return (
    <>
      <NavBar>
        <Logo />
        <SearchInput query={query} setQuery={setQuery} />
        <NumResult length={movies.length} />
      </NavBar>
      <Main>
        <Box>
          {!loading && !error && (
            <ListMovie onSelectMovie={handleSelectMovie} list={movies} />
          )}
          {loading && <p className="loader">Loading...</p>}
          {error && <p className="error">{error}</p>}
        </Box>
        <Box>
          {!selectedId ? (
            <>
              <Summary
                length={watched.length}
                // avgImdbRating={avgImdbRating}
                // avgUserRating={avgUserRating}
                // avgRuntime={avgRuntime}
              />
              <ListWatchedMovie list={watched} />
            </>
          ) : (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseSelectMovie}
              onAddWatched={handleAddWatched}
            />
          )}
        </Box>
      </Main>
    </>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched }) {
  const [movieDetails, setMovieDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieDetails;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
    };
    onAddWatched(newWatchedMovie);
  }
  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        setLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        if (!res.ok) {
          throw new Error("Something went wrong");
        }
        const data = await res.json();
        if (data.Response === "False") {
          throw new Error(data.Error);
        }
        console.log(data);
        setMovieDetails(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }
    fetchMovieDetails();
  }, [selectedId]);

  return (
    <>
      {loading && <p className="loader">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="details">
          <header>
            <button
              className="btn-back"
              onClick={() => {
                onCloseMovie();
              }}
            >
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`}></img>
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>
                <span>⭐</span>
                {imdbRating} IMBd rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarRating maxRating={10} size={24} />
              <button
                className="btn-add"
                onClick={() => {
                  handleAdd();
                }}
              >
                + Add to list
              </button>
            </div>
            <p>
              <em>{plot}</em>
              <p>Starring {actors}</p>
              <p>Directed by {director}</p>
              <p> {genre}</p>
            </p>
          </section>
          {/* {selectedId} */}
        </div>
      )}
    </>
  );
}
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function SearchInput({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function NumResult({ length }) {
  return (
    <p className="num-results">
      Found <strong>{length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
function ListMovie({ list, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {list?.map((movie) => (
        <li
          key={movie.imdbID}
          onClick={() => {
            onSelectMovie(movie.imdbID);
          }}
        >
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>📅</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
function ListWatchedMovie({ list, children }) {
  return (
    <>
      {children}
      <ul className="list">
        {list?.map((movie) => (
          <li key={movie.imdbID}>
            <img src={movie.poster} alt={`${movie.title} poster`} />
            <h3>{movie.title}</h3>
            <div>
              <p>
                <span>⭐️</span>
                <span>{movie.imdbRating}</span>
              </p>
              <p>
                <span>🌟</span>
                <span>{movie.userRating}</span>
              </p>
              <p>
                <span>⏳</span>
                <span>{movie.runtime} min</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
function Summary({ length, avgImdbRating, avgUserRating, avgRuntime }) {
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
