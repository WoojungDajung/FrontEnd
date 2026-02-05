import { getLocations } from "@/api/location";
import { useQuery } from "@tanstack/react-query";

interface useLocationsQueryProps {
  appointmentId: string;
}

const useLocationsQuery = ({ appointmentId }: useLocationsQueryProps) => {
  return useQuery({
    queryKey: ["appointment-locations", appointmentId],
    queryFn: ({ queryKey }) => getLocations(queryKey[1]),
  });
};

export default useLocationsQuery;
