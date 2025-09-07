import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSkus,
  createSku,
  updateSku,
  deleteSku,
  transitionSku,
} from "../api/client";
import type { Sku, SkuStatus } from "../types";

export function useSkus(params: { page: number; status?: SkuStatus }) {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["skus", params.page, params.status],
    queryFn: () =>
      listSkus({ page: params.page, status: params.status, limit: 4 }),
    placeholderData: (previousData) => previousData,
  });

  const createM = useMutation({
    mutationFn: (
      payload: Omit<Sku, "id" | "status"> & { status?: SkuStatus }
    ) => createSku(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skus"] }),
  });
  const updateM = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: Sku["id"];
      payload: Partial<Omit<Sku, "id" | "status">>;
    }) => updateSku(String(id), payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skus"] }),
  });
  const deleteM = useMutation({
    mutationFn: (id: Sku["id"]) => deleteSku(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skus"] }),
  });
  const transitionM = useMutation({
    mutationFn: ({ id, status }: { id: Sku["id"]; status: SkuStatus }) =>
      transitionSku(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["skus"] }),
  });

  return { list, createM, updateM, deleteM, transitionM };
}
