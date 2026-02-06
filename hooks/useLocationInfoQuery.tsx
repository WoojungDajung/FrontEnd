import { getLocation } from "@/api/location";
import { useQuery } from "@tanstack/react-query";

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

  });
};

export default useLocationInfoQuery;
