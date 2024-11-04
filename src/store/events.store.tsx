import { create } from "zustand";
import { eventsMock } from "../events-mock";

export interface EventType {
  id: string;
  start_date: Date;
  end_date: Date;
  title: string;
}

type State = {
  events: EventType[];
  addEvent: (event: EventType) => void;
  removeEvent: (id: string) => void;
  editEvent: (event: EventType) => void;
};

export const useEventStore = create<State>((set) => ({
  events: eventsMock,
  addEvent: (event: EventType) =>
    set((state) => ({ events: [...state.events, event] })),
  removeEvent: (id: string) => {
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    }));
  },

  editEvent: (event: EventType) => {
    set((state) => ({
      events: state.events.map((e) => (e.id === event.id ? event : e)),
    }));
  },
}));
