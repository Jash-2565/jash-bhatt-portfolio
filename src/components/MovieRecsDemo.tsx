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
      } catch {
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

  const exampleList = useMemo(
    () => ['Avatar', 'The Dark Knight', 'Interstellar'],
    []
  );

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 shadow-sm p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-lg font-semibold text-slate-100">Movie Recommendation Demo</h4>
          <p className="text-sm text-slate-400">Dataset: `public/models/movie_metadata.csv`</p>
        </div>
        <span className="text-xs uppercase tracking-widest text-slate-300 bg-slate-800 px-3 py-1 rounded-full">
          {status}
        </span>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter movie title"
            className="w-full flex-1 min-w-0 min-h-11 rounded-lg border border-slate-500/80 bg-slate-950 px-3 py-2.5 text-base sm:text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#01F5D1]/60 focus:ring-2 focus:ring-[#01F5D1]/30"
          />
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:items-center lg:w-auto lg:flex-nowrap lg:gap-2">
            <button
              type="button"
              onClick={handleRecommend}
              disabled={!isReady}
              className="min-h-11 px-4 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-950 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Recommend
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="min-h-11 px-4 py-2 rounded-full text-sm font-semibold border border-slate-600 text-slate-200 hover:border-slate-400 transition"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
          {exampleList.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuery(item)}
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border border-slate-600 px-4 py-1.5 text-sm text-slate-300 hover:border-slate-400 active:border-[#01F5D1]"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm text-slate-300 mb-3">{message}</p>
        {results.length > 0 && (
          <ul className="grid gap-2 md:grid-cols-2">
            {results.map((title) => (
              <li key={title} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100">
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
