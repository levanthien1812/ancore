import { getUser } from "@/lib/actions/user.actions";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5,
  });
}
