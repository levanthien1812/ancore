import { getNotifications } from "../actions/notification.actions";
import { useQuery } from "@tanstack/react-query";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 1000 * 60 * 5,
  });
}
