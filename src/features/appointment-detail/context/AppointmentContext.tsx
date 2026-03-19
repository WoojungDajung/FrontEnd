"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type AppointmentPageContextValue = {
  selectedParticipantId: number | null;
  selectParticipant: (participantId: number | null) => void;
  selectedPlaceId: number | null;
  selectPlace: (placeId: number | null) => void;
};

const AppointmentPageContext =
  createContext<AppointmentPageContextValue | null>(null);

type AppointmentPageProviderProps = {
  children: ReactNode;
};

export function AppointmentPageProvider({
  children,
}: AppointmentPageProviderProps) {
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    number | null
  >(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

  const value = useMemo(
    () => ({
      selectedParticipantId,
      selectParticipant: setSelectedParticipantId,
      selectedPlaceId,
      selectPlace: setSelectedPlaceId,
    }),
    [selectedParticipantId, selectedPlaceId],
  );

  return (
    <AppointmentPageContext.Provider value={value}>
      {children}
    </AppointmentPageContext.Provider>
  );
}

export function useAppointmentPage() {
  const context = useContext(AppointmentPageContext);

  if (!context) {
    throw new Error(
      "useAppointmentPage must be used within AppointmentPageProvider",
    );
  }

  return context;
}
