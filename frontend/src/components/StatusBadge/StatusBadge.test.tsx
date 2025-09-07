import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusBadge from "./StatusBadge";
import { SkuStatusEnum } from "../../types";

const STATUS_COLORS = {
  [SkuStatusEnum.PRE_CADASTRO]: "rgb(237, 108, 2)",
  [SkuStatusEnum.CADASTRO_COMPLETO]: "rgb(2, 136, 209)",
  [SkuStatusEnum.ATIVO]: "rgb(46, 125, 50)",
  [SkuStatusEnum.DESATIVADO]: "rgba(0, 0, 0, 0.87)",
  [SkuStatusEnum.CANCELADO]: "rgb(211, 47, 47)",
};

describe("StatusBadge", () => {
  it.each([
    [SkuStatusEnum.PRE_CADASTRO, "Pré-cadastro"],
    [SkuStatusEnum.CADASTRO_COMPLETO, "Cadastro completo"],
    [SkuStatusEnum.ATIVO, "Ativo"],
    [SkuStatusEnum.DESATIVADO, "Desativado"],
    [SkuStatusEnum.CANCELADO, "Cancelado"],
  ])("renders %s status correctly", (status, label) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveTextContent(label);
    expect(badge).toHaveStyle({ borderColor: STATUS_COLORS[status] });
  });
});
