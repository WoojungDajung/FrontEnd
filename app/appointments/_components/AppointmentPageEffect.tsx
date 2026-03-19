"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useEffectEvent } from "react";
import { getAppointment } from "@/src/features/appointment-detail/api/getAppointment";
import { sendGTM } from "@/src/shared/lib/googleTagManager/sendGTM";
import { EnterAppointmentPageEventData } from "@/src/shared/lib/googleTagManager/gtmEventDataTypes";
import { getDateVoteStatusByUser } from "@/src/features/appointment-detail/vote-date/api/getDateVoteStatusByUser";
import { getMyVoteLocation } from "@/src/features/appointment-detail/vote-location/api/getMyVoteLocation";

interface AppointmentPageEffectProps {
  appointmentId: string;
}

const AppointmentPageEffect = ({
  appointmentId,
}: AppointmentPageEffectProps) => {
  const queryClient = useQueryClient();

  const sendGTMEnterEvent = useEffectEvent(async () => {
    const {
      appointment: { hostYn, appointmentUserId },
    } = await queryClient.fetchQuery({
      queryKey: ["appointment", appointmentId],
      queryFn: ({ queryKey }) => getAppointment(queryKey[1]),
      meta: { requiresAuth: true },
    });
    const { possibleList, ambList } = await queryClient.fetchQuery({
      queryKey: ["date-vote-status-by-user", appointmentId, appointmentUserId],
      queryFn: ({ queryKey }) =>
        getDateVoteStatusByUser(queryKey[1] as string, queryKey[2] as number),
      meta: { requiresAuth: true },
    });
    const myVotedLocations = await queryClient.fetchQuery({
      queryKey: ["my-vote-appointment-location", appointmentId],
      queryFn: ({ queryKey }) => getMyVoteLocation(queryKey[1]),
      meta: { requiresAuth: true },
    });

    const eventData: EnterAppointmentPageEventData = {
      event: "enter_appointment",
      appointment_id: appointmentId,
      user_role: hostYn === "Y" ? "host" : "guest",
      has_schedule_voted: possibleList.length > 0 || ambList.length > 0,
      has_place_voted: myVotedLocations.length > 0,
    };
    sendGTM(eventData);
  });

  useEffect(() => {
    sendGTMEnterEvent();
  }, [appointmentId]);

  return null;
};

export default AppointmentPageEffect;
