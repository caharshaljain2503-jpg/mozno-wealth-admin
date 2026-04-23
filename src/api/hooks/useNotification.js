import { useQuery, useMutation } from "@tanstack/react-query";
import adminClient from "../axios.instance";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await adminClient.get("/notifications");
      return res.data.data;
    },
  });
};

export const useMarkAllAsRead = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await adminClient.post("/notifications/mark-all-read");
      return res.data;
    },
  });
};
