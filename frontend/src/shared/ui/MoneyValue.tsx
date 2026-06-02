import { formatearMonedaSinCentavos } from '../lib/money';

type MoneyValueProps = {
  valor: number | null | undefined;
  fallback?: string;
};

export function MoneyValue({ valor, fallback = '$ -' }: MoneyValueProps) {
  if (valor === null || valor === undefined) {
    return <>{fallback}</>;
  }

  return <>{formatearMonedaSinCentavos(valor)}</>;
}
