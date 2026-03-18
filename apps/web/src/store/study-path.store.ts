import { create } from 'zustand';

interface StudyPathState {
  currentStudyPathId: string | null;
  currentPhaseId: string | null;
  setCurrentStudyPath: (id: string) => void;
  setCurrentPhase: (id: string) => void;
  clear: () => void;
}

export const useStudyPathStore = create<StudyPathState>((set) => ({
  currentStudyPathId: null,
  currentPhaseId: null,
  setCurrentStudyPath: (id) => set({ currentStudyPathId: id }),
  setCurrentPhase: (id) => set({ currentPhaseId: id }),
  clear: () => set({ currentStudyPathId: null, currentPhaseId: null }),
}));
