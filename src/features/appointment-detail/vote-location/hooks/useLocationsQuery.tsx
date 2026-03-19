import { useQuery } from "@tanstack/react-query";
import { getLocations } from "../api/getLocations";

interface useLocationsQueryProps {
  appointmentId: string;
}

const useLocationsQuery = ({ appointmentId }: useLocationsQueryProps) => {
  return useQuery({
    queryKey: ["appointment-locations", appointmentId],
    queryFn: ({ queryKey }) => getLocations(queryKey[1]),
    meta: { requiresAuth: true },
  });
};

export default useLocationsQuery;
