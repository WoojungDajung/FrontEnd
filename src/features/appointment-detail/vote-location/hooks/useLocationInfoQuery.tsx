import { useQuery } from "@tanstack/react-query";
import { getLocation } from "../api/getLocation";

interface useLocationInfoQueryProps {
  appointmentId: string;
  placeId: number;
}

const useLocationInfoQuery = ({
  appointmentId,
  placeId,
}: useLocationInfoQueryProps) => {
  return useQuery({
    queryKey: ["appointment-location", appointmentId, placeId],
    queryFn: ({ queryKey }) =>
      getLocation(queryKey[1].toString(), Number(queryKey[2])),
    meta: { requiresAuth: true },
  });
};

export default useLocationInfoQuery;
