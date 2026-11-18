import { createContext, useContext } from 'react';

// Shared slideshow navigation: { index, frames, goTo(idOrIndex) }
export const FilmContext = createContext({ index: 0, frames: [], goTo: () => {} });
export const useFilm = () => useContext(FilmContext);
