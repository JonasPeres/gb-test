import axios from "axios";
import type { Sku, ApiList } from "@/types";
import type { SkuStatus } from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE as string;

const http = axios.create({ baseURL: API_BASE, timeout: 10000 });

export async function listSkus(params?: {
  page?: number;
  limit?: number;
  status?: SkuStatus;
}) {
  const { data } = await http.get<ApiList<Sku>>("/skus", { params });
  return data;
}

export async function getSku(id: string): Promise<Sku> {
  const { data } = await http.get<Sku>(`/skus/${id}`);
  return data;
}

export async function createSku(
  payload: Omit<Sku, "id" | "status"> & { status?: SkuStatus }
): Promise<Sku> {
  const { data } = await http.post<Sku>("/skus", payload);
  return data;
}

export async function updateSku(
  id: string,
  payload: Partial<Omit<Sku, "id" | "status">>
): Promise<Sku> {
  const { data } = await http.patch<Sku>(`/skus/${id}`, payload);
  return data;
}

export async function deleteSku(id: string): Promise<{ ok: boolean }> {
  const { data } = await http.delete<{ ok: boolean }>(`${"/skus"}/${id}`);
  return data;
}

export async function transitionSku(
  id: string,
  target: SkuStatus
): Promise<Sku> {
  const { data } = await http.post<Sku>(`/skus/${id}/transition`, {
    target,
  });
  return data;
}
