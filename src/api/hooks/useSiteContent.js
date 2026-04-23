import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import adminClient from "../axios.instance";

const key = ["site-content"];

export const useSiteContent = () =>
  useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await adminClient.get("/site-content");
      return res.data?.data;
    },
    staleTime: 30000,
  });

export const useUpdateSiteContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await adminClient.put("/site-content", payload);
      return res.data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
};

