import { RootState } from "../store";

// Export selector to get gallery state
export const selectGallery = (state: RootState) => state.gallery;