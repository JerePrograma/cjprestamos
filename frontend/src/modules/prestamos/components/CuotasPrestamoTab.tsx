import type { ComponentProps } from "react";
import { CuotasPrestamoPanel } from "../../cuotas/components/CuotasPrestamoPanel";

type CuotasPrestamoTabProps = ComponentProps<typeof CuotasPrestamoPanel>;

export function CuotasPrestamoTab(props: CuotasPrestamoTabProps) {
  return <CuotasPrestamoPanel {...props} />;
}
