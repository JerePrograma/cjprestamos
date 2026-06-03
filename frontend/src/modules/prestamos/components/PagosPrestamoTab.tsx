import type { ComponentProps } from "react";
import { PagosPrestamoPanel } from "../../pagos/components/PagosPrestamoPanel";

type PagosPrestamoTabProps = ComponentProps<typeof PagosPrestamoPanel>;

export function PagosPrestamoTab(props: PagosPrestamoTabProps) {
  return <PagosPrestamoPanel {...props} />;
}
