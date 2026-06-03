import type { ComponentProps } from "react";
import { PrestamoDetallePanel } from "./PrestamoDetallePanel";

type ResumenPrestamoTabProps = ComponentProps<typeof PrestamoDetallePanel>;

export function ResumenPrestamoTab(props: ResumenPrestamoTabProps) {
  return <PrestamoDetallePanel {...props} />;
}
