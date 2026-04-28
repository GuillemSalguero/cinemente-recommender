// Mock external reviews. Replace with real API later (Rotten Tomatoes, IMDb, Letterboxd...).

export interface ExternalReview {
  author: string;
  source: "Rotten Tomatoes" | "IMDb" | "Letterboxd" | "Metacritic" | "FilmAffinity";
  rating: number; // 0-5
  date: string;
  text: string;
  avatarSeed: string;
}

const SOURCES: ExternalReview["source"][] = [
  "Rotten Tomatoes",
  "IMDb",
  "Letterboxd",
  "Metacritic",
  "FilmAffinity",
];

const AUTHORS = [
  "Marta Giménez", "Carlos Ruiz", "Laura Fernández", "Diego Torres",
  "Ana Morales", "Javier Pons", "Lucía Navarro", "Pablo Esteve",
  "Sara Vidal", "Roberto Cano", "Núria Bosch", "Iván Castro",
  "Elena Ortiz", "Marc Soler", "Cristina Vega",
];

const TEMPLATES = [
  "Una experiencia visual y narrativa que se queda contigo durante días. La dirección es impecable.",
  "El guion brilla en los detalles pequeños. No es perfecta, pero tiene momentos memorables.",
  "Un ritmo absorbente desde la primera escena. Las actuaciones elevan cada secuencia.",
  "La fotografía merece un visionado por sí sola. El argumento, sólido aunque previsible.",
  "Quizá demasiado lenta en su segundo acto, pero el desenlace lo justifica todo.",
  "Una propuesta valiente que no teme incomodar al espectador. Cine en estado puro.",
  "Música, montaje y dirección artística en perfecta sintonía. Pequeña joya.",
  "Le sobran 15 minutos pero la atmósfera es magnética. Recomendable.",
  "Disfrutable de principio a fin, con un giro final que reordena toda la historia.",
  "No es para todos los públicos, pero quien conecte saldrá del cine pensando en ella.",
  "Sensible, inteligente y bellamente filmada. Un descubrimiento.",
  "Personajes complejos y diálogos afilados. El reparto está sublime.",
];

// Deterministic pseudo-random based on title so the list is stable per movie.
function seeded(title: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < title.length; i++) {
    h ^= title.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

export function getExternalReviews(title: string, count = 12): ExternalReview[] {
  const rand = seeded(title);
  const reviews: ExternalReview[] = [];
  const usedAuthors = new Set<string>();

  for (let i = 0; i < count; i++) {
    let author = AUTHORS[Math.floor(rand() * AUTHORS.length)];
    while (usedAuthors.has(author) && usedAuthors.size < AUTHORS.length) {
      author = AUTHORS[Math.floor(rand() * AUTHORS.length)];
    }
    usedAuthors.add(author);

    const source = SOURCES[Math.floor(rand() * SOURCES.length)];
    const rating = Math.max(1, Math.round((2.5 + rand() * 2.5) * 2) / 2); // 1-5, .5 steps
    const text = TEMPLATES[Math.floor(rand() * TEMPLATES.length)];
    const daysAgo = Math.floor(rand() * 365);
    const date = new Date(Date.now() - daysAgo * 86400000).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    reviews.push({
      author,
      source,
      rating,
      date,
      text,
      avatarSeed: `${author}-${i}`,
    });
  }

  return reviews;
}
