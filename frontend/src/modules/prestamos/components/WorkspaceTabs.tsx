export type WorkspaceTab = "resumen" | "cuotas" | "pagos";

export const DEFAULT_WORKSPACE_TAB: WorkspaceTab = "resumen";

const tabs: Array<{ id: WorkspaceTab; etiqueta: string }> = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "cuotas", etiqueta: "Cuotas" },
  { id: "pagos", etiqueta: "Pagos" },
];

export function esWorkspaceTab(valor: string | null): valor is WorkspaceTab {
  return valor === "resumen" || valor === "cuotas" || valor === "pagos";
}

function TabWorkspace({
  activa,
  children,
  onClick,
}: {
  activa: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-lg px-2 py-1.5 text-xs font-semibold transition sm:text-sm",
        activa
          ? "bg-surface-raised text-app shadow-app-xs"
          : "text-muted hover:bg-surface-raised hover:text-app",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

type WorkspaceTabsProps = {
  tabActiva: WorkspaceTab;
  onCambiarTab: (tab: WorkspaceTab) => void;
};

export function WorkspaceTabs({
  tabActiva,
  onCambiarTab,
}: WorkspaceTabsProps) {
  return (
    <nav
      className="grid grid-cols-3 gap-1 rounded-md border border-subtle bg-surface-inset p-1"
      aria-label="Secciones del workspace de préstamo"
    >
      {tabs.map((tab) => (
        <TabWorkspace
          key={tab.id}
          activa={tabActiva === tab.id}
          onClick={() => onCambiarTab(tab.id)}
        >
          {tab.etiqueta}
        </TabWorkspace>
      ))}
    </nav>
  );
}
