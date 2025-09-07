import axios from "axios";
import type { Sku, ApiList } from "@/types";
import type { SkuStatus } from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";
const SKUS_PATH = import.meta.env.VITE_API_SKUS_PATH ?? "/skus";
const http = axios.create({ baseURL: API_BASE, timeout: 10000 });

export async function listSkus(params?: {
  page?: number;
  limit?: number;
  status?: SkuStatus;
  q?: string;
}) {
  const { data } = await http.get<ApiList<Sku>>(SKUS_PATH, { params });
  return data;
}

export async function getSku(id: string): Promise<Sku> {
  const { data } = await http.get<Sku>(`${SKUS_PATH}/${id}`);
  return data;
}

export async function createSku(
  payload: Omit<Sku, "id" | "status"> & { status?: SkuStatus }
): Promise<Sku> {
  const { data } = await http.post<Sku>(SKUS_PATH, payload);
  return data;
}

export async function updateSku(
  id: string,
  payload: Partial<Omit<Sku, "id" | "status">>
): Promise<Sku> {
  const { data } = await http.patch<Sku>(`${SKUS_PATH}/${id}`, payload);
  return data;
}

export async function deleteSku(id: string): Promise<{ ok: boolean }> {
  const { data } = await http.delete<{ ok: boolean }>(`${SKUS_PATH}/${id}`);
  return data;
}

export async function transitionSku(
  id: string,
  target: SkuStatus
): Promise<Sku> {
  const { data } = await http.post<Sku>(`${SKUS_PATH}/${id}/transition`, {
    target,
  });
  return data;
}
