import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Every user, once. Used for the names of direct conversations, member lists and the
// new-conversation picker, which searches this list in the browser.
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.getUsers(),
    staleTime: 5 * 60 * 1000,
  });
}
