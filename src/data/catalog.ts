import type { Movie } from "@/types/movie";

// Shared mock catalogue. Replace with real backend later.
export const CATALOG: Movie[] = [
  { title: "Ex Machina", year: "2015", genre: "Drama, Sci-Fi, Thriller", description: "Un programador es seleccionado para participar en un experimento revolucionario de inteligencia artificial.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/dLxKABBJnFMQmJoFuUFqzLvKjpE.jpg", director: "Alex Garland", runtime: 107, tomatometer: 92, link: "m/ex_machina" },
  { title: "Gone Girl", year: "2014", genre: "Drama, Mystery, Thriller", description: "Con la desaparición de su esposa en su quinto aniversario, Nick Dunne se convierte en el principal sospechoso.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/qymaJhucbpGpIR94Qs3bmOVqFTI.jpg", director: "David Fincher", runtime: 149, tomatometer: 87, link: "m/gone_girl" },
  { title: "The Prestige", year: "2006", genre: "Drama, Mystery, Sci-Fi", description: "Dos magos rivales en la Londres victoriana se embarcan en una competencia peligrosa.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg", director: "Christopher Nolan", runtime: 130, tomatometer: 76, link: "m/the_prestige" },
  { title: "Predestination", year: "2014", genre: "Action, Drama, Sci-Fi", description: "Un agente temporal embarca en una misión final para atrapar al único criminal que le ha eludido.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/kGwjnMfXMiYmJoav0GO4nBRiPHn.jpg", director: "Michael Spierig, Peter Spierig", runtime: 97, tomatometer: 84, link: "m/predestination" },
  { title: "Shutter Island", year: "2010", genre: "Mystery, Thriller", description: "Un alguacil investiga la desaparición de una paciente en un hospital psiquiátrico en una isla remota.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/kve20tXMHZp4y9Q31GVfEhpJIG9.jpg", director: "Martin Scorsese", runtime: 138, tomatometer: 68, link: "m/shutter_island" },
  { title: "Coherence", year: "2013", genre: "Mystery, Sci-Fi, Thriller", description: "Durante una cena entre amigos, el paso de un cometa provoca eventos extraños.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/7BKFbNFto7aBIA5tGbmajBvi72I.jpg", director: "James Ward Byrkit", runtime: 89, tomatometer: 88, link: "m/coherence" },
  { title: "Arrival", year: "2016", genre: "Drama, Mystery, Sci-Fi", description: "Cuando naves extraterrestres aterrizan en todo el mundo, una lingüista es reclutada para descifrar su lenguaje.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg", director: "Denis Villeneuve", runtime: 116, tomatometer: 94, link: "m/arrival" },
  { title: "Oldboy", year: "2003", genre: "Action, Drama, Mystery", description: "Un hombre es encerrado durante 15 años sin explicación y al ser liberado busca venganza.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4Qxka.jpg", director: "Park Chan-wook", runtime: 120, tomatometer: 82, link: "m/oldboy" },
  { title: "The Sixth Sense", year: "1999", genre: "Drama, Mystery, Thriller", description: "Un psicólogo infantil intenta ayudar a un niño que afirma ver personas muertas.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/fIssD3w3SvIhPPmVo4WMgZDVLID.jpg", director: "M. Night Shyamalan", runtime: 107, tomatometer: 86, link: "m/the_sixth_sense" },
  { title: "Memento", year: "2000", genre: "Mystery, Thriller", description: "Un hombre con pérdida de memoria a corto plazo usa notas y tatuajes para cazar al asesino de su esposa.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg", director: "Christopher Nolan", runtime: 113, tomatometer: 93, link: "m/memento" },
  { title: "Get Out", year: "2017", genre: "Horror, Mystery, Thriller", description: "Un joven afroamericano visita la familia de su novia blanca y descubre inquietantes secretos.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg", director: "Jordan Peele", runtime: 104, tomatometer: 98, link: "m/get_out" },
  { title: "The Others", year: "2001", genre: "Horror, Mystery, Thriller", description: "Una mujer y sus dos hijos fotosensibles viven en una mansión que parece estar embrujada.", reason: "", poster_url: "https://image.tmdb.org/t/p/w500/aN5BU5fVjEFKApGt2gPSMTkBmUK.jpg", director: "Alejandro Amenábar", runtime: 101, tomatometer: 83, link: "m/the_others" },
];

export const moviesByDirector = (name: string): Movie[] => {
  const target = name.trim().toLowerCase();
  return CATALOG.filter((m) =>
    m.director
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .includes(target)
  );
};
