import { useEffect, useMemo, useState } from 'react';

type MovieRow = {
  movie_title: string;
  genres: string;
  director_name: string;
  actor_1_name: string;
  actor_2_name: string;
  actor_3_name: string;
  country: string;
  combined: string;
};

type Vector = Map<string, number>;

const DATA_URL = '/models/movie_metadata.csv';
const RESULT_COUNT = 10;

const normalize = (value: string) => value.toLowerCase().trim();

const tokenize = (value: string) => {
  const tokens = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/);
  return tokens.filter(Boolean);
};

const toVector = (value: string) => {
  const vec: Vector = new Map();
  tokenize(value).forEach((token) => {
    vec.set(token, (vec.get(token) ?? 0) + 1);
  });
  return vec;
};

const vectorNorm = (vec: Vector) => {
  let sum = 0;
  vec.forEach((count) => {
    sum += count * count;
  });
  return Math.sqrt(sum);
};

const cosineSimilarity = (a: Vector, b: Vector, bNorm: number) => {
  if (a.size === 0 || b.size === 0 || bNorm === 0) return 0;
  let dot = 0;
  a.forEach((value, key) => {
    const other = b.get(key);
    if (other) dot += value * other;
  });
  const aNorm = vectorNorm(a);
  return aNorm === 0 ? 0 : dot / (aNorm * bNorm);
};

const diceCoefficient = (a: string, b: string) => {
  const pairs = (text: string) => {
    const cleaned = ` ${normalize(text)} `;
    const result: string[] = [];
    for (let i = 0; i < cleaned.length - 1; i += 1) {
      result.push(cleaned.slice(i, i + 2));
    }
    return result;
  };
  const aPairs = pairs(a);
  const bPairs = pairs(b);
  if (aPairs.length === 0 || bPairs.length === 0) return 0;
  const counts = new Map<string, number>();
  aPairs.forEach((pair) => counts.set(pair, (counts.get(pair) ?? 0) + 1));
  let overlap = 0;
  bPairs.forEach((pair) => {
    const count = counts.get(pair) ?? 0;
    if (count > 0) {
      overlap += 1;
      counts.set(pair, count - 1);
    }
  });
  return (2 * overlap) / (aPairs.length + bPairs.length);
};

const parseCsv = (text: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(value);
      if (row.length > 1 || row[0] !== '') {
        rows.push(row);
      }
      row = [];
      value = '';
      continue;
    }

    value += char;
  }

  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
};

const MovieRecsDemo = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [movies, setMovies] = useState<MovieRow[]>([]);
  const [vectors, setVectors] = useState<Vector[]>([]);
  const [norms, setNorms] = useState<number[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [message, setMessage] = useState('Load the dataset to start.');

  const isReady = status === 'ready';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStatus('loading');
      setMessage('Loading movie dataset...');
      try {
        const res = await fetch(DATA_URL);
        const csvText = await res.text();
        const rows = parseCsv(csvText);
        const [header, ...dataRows] = rows;
        const colIndex = (name: string) => header.indexOf(name);

        const idx = {
          title: colIndex('movie_title'),
          genres: colIndex('genres'),
          director: colIndex('director_name'),
          actor1: colIndex('actor_1_name'),
          actor2: colIndex('actor_2_name'),
          actor3: colIndex('actor_3_name'),
          country: colIndex('country')
        };

        const parsed: MovieRow[] = dataRows
          .filter((row) => row[idx.title])
          .map((row) => {
            const safe = (value?: string) => (value ?? '').trim();
            const combined = [
              safe(row[idx.genres]),
              safe(row[idx.director]),
              safe(row[idx.actor1]),
              safe(row[idx.actor2]),
              safe(row[idx.actor3]),
              safe(row[idx.country])
            ].join(' ');
            return {
              movie_title: safe(row[idx.title]),
              genres: safe(row[idx.genres]),
              director_name: safe(row[idx.director]),
              actor_1_name: safe(row[idx.actor1]),
              actor_2_name: safe(row[idx.actor2]),
              actor_3_name: safe(row[idx.actor3]),
              country: safe(row[idx.country]),
              combined
            };
          });

        const vecs = parsed.map((movie) => toVector(movie.combined));
        const vecNorms = vecs.map((vec) => vectorNorm(vec));

        if (!cancelled) {
          setMovies(parsed);
          setVectors(vecs);
          setNorms(vecNorms);
          setStatus('ready');
          setMessage(`Loaded ${parsed.length} movies. Try "Avatar" or "Inception".`);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage('Failed to load the dataset.');
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRecommend = () => {
    if (!query.trim() || !isReady) {
      setResults([]);
      return;
    }

    const best = movies.reduce(
      (acc, movie, index) => {
        const score = diceCoefficient(query, movie.movie_title);
        if (score > acc.score) {
          return { score, index };
        }
        return acc;
      },
      { score: 0, index: -1 }
    );

    if (best.index === -1 || best.score < 0.3) {
      setResults([]);
      setMessage(`No close match found for "${query}".`);
      return;
    }

    const targetVector = vectors[best.index];
    const scored = movies.map((movie, idx) => ({
      title: movie.movie_title,
      score: cosineSimilarity(targetVector, vectors[idx], norms[idx]),
      idx
    }));

    const top = scored
      .filter((item) => item.idx !== best.index)
      .sort((a, b) => b.score - a.score)
      .slice(0, RESULT_COUNT)
      .map((item) => item.title);

    setMessage(`Top picks similar to "${movies[best.index].movie_title}":`);
    setResults(top);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setMessage('Enter a movie to see recommendations.');
  };

  const exampleList = useMemo(() => ['Avatar', 'The Dark Knight', 'Inception', 'Titanic'], []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">Movie Recommendation Demo</h4>
          <p className="text-sm text-slate-500">Dataset: `public/models/movie_metadata.csv`</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          {status}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a movie title..."
            className="flex-1 min-w-0 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto md:flex-nowrap md:gap-2">
            <button
              type="button"
              onClick={handleRecommend}
              disabled={!isReady}
              className="w-full px-4 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition sm:w-auto"
            >
              Recommend
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="w-full px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:border-slate-400 transition sm:w-auto"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          {exampleList.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuery(item)}
              className="px-3 py-1 rounded-full border border-slate-200 hover:border-slate-400"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm text-slate-600 mb-3">{message}</p>
        {results.length > 0 && (
          <ul className="grid gap-2 md:grid-cols-2">
            {results.map((title) => (
              <li key={title} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                {title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MovieRecsDemo;
