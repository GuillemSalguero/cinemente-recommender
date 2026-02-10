import { useState, useCallback } from "react";
import type { Movie } from "@/types/movie";

const MOCK_MOVIES: Movie[] = [
  {
    title: "Ex Machina",
    year: "2015",
    genre: "Drama, Sci-Fi, Thriller",
    description: "Un programador es seleccionado para participar en un experimento revolucionario de inteligencia artificial, evaluando las cualidades humanas de un robot con apariencia femenina.",
    reason: "Combina suspenso psicológico con un giro final devastador que redefine quién controla a quién.",
    poster_url: "https://image.tmdb.org/t/p/w500/dLxKABBJnFMQmJoFuUFqzLvKjpE.jpg",
    director: "Alex Garland",
    runtime: 107,
    tomatometer: 92,
    link: "m/ex_machina",
  },
  {
    title: "Gone Girl",
    year: "2014",
    genre: "Drama, Mystery, Thriller",
    description: "Con la desaparición de su esposa en su quinto aniversario, Nick Dunne se convierte en el principal sospechoso, pero la verdad es mucho más retorcida.",
    reason: "David Fincher construye una obra maestra del suspenso donde cada revelación cambia completamente tu perspectiva.",
    poster_url: "https://image.tmdb.org/t/p/w500/qymaJhucbpGpIR94Qs3bmOVqFTI.jpg",
    director: "David Fincher",
    runtime: 149,
    tomatometer: 87,
    link: "m/gone_girl",
  },
  {
    title: "The Prestige",
    year: "2006",
    genre: "Drama, Mystery, Sci-Fi",
    description: "Dos magos rivales en la Londres victoriana se embarcan en una competencia cada vez más peligrosa para crear la ilusión definitiva.",
    reason: "Christopher Nolan teje una narrativa laberíntica donde el mayor truco es el que la película te juega a ti.",
    poster_url: "https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg",
    director: "Christopher Nolan",
    runtime: 130,
    tomatometer: 76,
    link: "m/the_prestige",
  },
  {
    title: "Predestination",
    year: "2014",
    genre: "Action, Drama, Sci-Fi",
    description: "Un agente temporal embarca en una misión final para atrapar al único criminal que le ha eludido a través del tiempo.",
    reason: "Uno de los giros más audaces del cine de ciencia ficción, una paradoja temporal perfectamente ejecutada.",
    poster_url: "https://image.tmdb.org/t/p/w500/kGwjnMfXMiYmJoav0GO4nBRiPHn.jpg",
    director: "Michael Spierig, Peter Spierig",
    runtime: 97,
    tomatometer: 84,
    link: "m/predestination",
  },
  {
    title: "Shutter Island",
    year: "2010",
    genre: "Mystery, Thriller",
    description: "Un alguacil investiga la desaparición de una paciente en un hospital psiquiátrico en una isla remota, pero nada es lo que parece.",
    reason: "Scorsese manipula magistralmente tu percepción hasta un desenlace que te obliga a replantear toda la película.",
    poster_url: "https://image.tmdb.org/t/p/w500/kve20tXMHZp4y9Q31GVfEhpJIG9.jpg",
    director: "Martin Scorsese",
    runtime: 138,
    tomatometer: 68,
    link: "m/shutter_island",
  },
  {
    title: "Coherence",
    year: "2013",
    genre: "Mystery, Sci-Fi, Thriller",
    description: "Durante una cena entre amigos, el paso de un cometa provoca eventos extraños que desafían la realidad.",
    reason: "Con un presupuesto mínimo logra un suspenso creciente donde las posibilidades se multiplican de forma aterradora.",
    poster_url: "https://image.tmdb.org/t/p/w500/7BKFbNFto7aBIA5tGbmajBvi72I.jpg",
    director: "James Ward Byrkit",
    runtime: 89,
    tomatometer: 88,
    link: "m/coherence",
  },
  {
    title: "Arrival",
    year: "2016",
    genre: "Drama, Mystery, Sci-Fi",
    description: "Cuando naves extraterrestres aterrizan en todo el mundo, una lingüista es reclutada para descifrar su lenguaje antes de que estalle un conflicto global.",
    reason: "El giro temporal de Villeneuve transforma una película de contacto alienígena en una historia profundamente emocional.",
    poster_url: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    director: "Denis Villeneuve",
    runtime: 116,
    tomatometer: 94,
    link: "m/arrival",
  },
  {
    title: "Oldboy",
    year: "2003",
    genre: "Action, Drama, Mystery",
    description: "Un hombre es encerrado en una habitación durante 15 años sin explicación. Al ser liberado, inicia una búsqueda obsesiva de venganza.",
    reason: "Park Chan-wook crea un thriller visceral cuyo giro final es uno de los más perturbadores de la historia del cine.",
    poster_url: "https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4Qxka.jpg",
    director: "Park Chan-wook",
    runtime: 120,
    tomatometer: 82,
    link: "m/oldboy",
  },
  {
    title: "The Sixth Sense",
    year: "1999",
    genre: "Drama, Mystery, Thriller",
    description: "Un psicólogo infantil intenta ayudar a un niño que afirma ver personas muertas.",
    reason: "El giro que definió una generación. Shyamalan en su mejor momento, donde cada detalle cobra nuevo significado.",
    poster_url: "https://image.tmdb.org/t/p/w500/fIssD3w3SvIhPPmVo4WMgZDVLID.jpg",
    director: "M. Night Shyamalan",
    runtime: 107,
    tomatometer: 86,
    link: "m/the_sixth_sense",
  },
  {
    title: "Memento",
    year: "2000",
    genre: "Mystery, Thriller",
    description: "Un hombre con pérdida de memoria a corto plazo usa notas y tatuajes para cazar al asesino de su esposa.",
    reason: "La estructura invertida de Nolan te coloca en la mente del protagonista, y el final redefine todo lo que creías saber.",
    poster_url: "https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg",
    director: "Christopher Nolan",
    runtime: 113,
    tomatometer: 93,
    link: "m/memento",
  },
  {
    title: "Get Out",
    year: "2017",
    genre: "Horror, Mystery, Thriller",
    description: "Un joven afroamericano visita la familia de su novia blanca y descubre inquietantes secretos bajo la superficie de amabilidad.",
    reason: "Jordan Peele fusiona horror social con un suspenso que escala hasta un clímax explosivo e inesperado.",
    poster_url: "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg",
    director: "Jordan Peele",
    runtime: 104,
    tomatometer: 98,
    link: "m/get_out",
  },
  {
    title: "The Others",
    year: "2001",
    genre: "Horror, Mystery, Thriller",
    description: "Una mujer que vive con sus dos hijos fotosensibles en una mansión oscura empieza a sospechar que la casa está embrujada.",
    reason: "Amenábar construye una atmósfera opresiva que culmina en uno de los giros más elegantes del cine de terror.",
    poster_url: "https://image.tmdb.org/t/p/w500/aN5BU5fVjEFKApGt2gPSMTkBmUK.jpg",
    director: "Alejandro Amenábar",
    runtime: 101,
    tomatometer: 83,
    link: "m/the_others",
  },
];

export function useMovieSearch() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setHasSearched(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1500));

    // Shuffle and pick 4
    const shuffled = [...MOCK_MOVIES].sort(() => Math.random() - 0.5);
    setMovies(shuffled.slice(0, 4));
    setIsLoading(false);
  }, []);

  const loadMore = useCallback(
    async (isMobile: boolean) => {
      if (movies.length >= 12) return;
      setIsLoadingMore(true);

      await new Promise((r) => setTimeout(r, 800));

      const count = isMobile ? 3 : 4;
      const remaining = MOCK_MOVIES.filter(
        (m) => !movies.some((existing) => existing.title === m.title)
      );
      const shuffled = remaining.sort(() => Math.random() - 0.5);
      const toAdd = shuffled.slice(0, Math.min(count, 12 - movies.length));

      setMovies((prev) => [...prev, ...toAdd]);
      setIsLoadingMore(false);
    },
    [movies]
  );

  const showLoadMore = movies.length < 12 && movies.length > 0;

  return { movies, isLoading, isLoadingMore, hasSearched, search, loadMore, showLoadMore };
}
