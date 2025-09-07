import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSkus,
  createSku,
  updateSku,
  deleteSku,
  transitionSku,
} from "../api/client";
import type { Sku, SkuStatus } from "../types";

interface UseSkusParams {
  page: number;
  status?: SkuStatus;
}

export function useSkus(params: UseSkusParams) {
  const queryClient = useQueryClient();

  const queryKey = ["skus", params.page, params.status];

  const listSkusQuery = useQuery({
    queryKey,
    queryFn: () =>
      listSkus({ page: params.page, status: params.status, limit: 4 }),
  });

  const invalidateSkus = () => {
    queryClient.invalidateQueries({ queryKey: ["skus"] });
  };

  const createSkuMutation = useMutation({
    mutationFn: (
      payload: Omit<Sku, "id" | "status"> & { status?: SkuStatus }
    ) => createSku(payload),
    onSuccess: invalidateSkus,
  });

  const updateSkuMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: Sku["id"];
      payload: Partial<Omit<Sku, "id" | "status">>;
    }) => updateSku(String(id), payload),
    onSuccess: invalidateSkus,
  });

  const deleteSkuMutation = useMutation({
    mutationFn: (id: Sku["id"]) => deleteSku(id),
    onSuccess: invalidateSkus,
  });

  const transitionSkuMutation = useMutation({
    mutationFn: ({ id, status }: { id: Sku["id"]; status: SkuStatus }) =>
      transitionSku(id, status),
    onSuccess: invalidateSkus,
  });

  return {
    listSkusQuery,
    createSkuMutation,
    updateSkuMutation,
    deleteSkuMutation,
    transitionSkuMutation,
  };
}
