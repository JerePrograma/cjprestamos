package com.cjprestamos.backend.reporte.service;

import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCarteraRiesgo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCuotaVencida;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteMovimientoPago;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteMovimientoPrestamo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReportePrestamoSaldo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteResumenEjecutivo;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReporteDashboardPdfService {

    private static final DateTimeFormatter FECHA_FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FECHA_HORA_FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Locale ARGENTINA = Locale.forLanguageTag("es-AR");
    private static final Color AZUL_OSCURO = new Color(31, 41, 55);
    private static final Color AZUL_HEADER = new Color(37, 99, 235);
    private static final Color BORDE = new Color(226, 232, 240);
    private static final Color TEXTO_SUAVE = new Color(71, 85, 105);

    private final Font titulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, AZUL_OSCURO);
    private final Font subtitulo = FontFactory.getFont(FontFactory.HELVETICA, 10, TEXTO_SUAVE);
    private final Font seccion = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(30, 64, 175));
    private final Font texto = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(15, 23, 42));
    private final Font textoChico = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(15, 23, 42));
    private final Font textoNegrita = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(15, 23, 42));
    private final Font headerTabla = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);

    public byte[] generarPdf(ReporteDashboardData reporte) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 32, 32, 32, 36);
            PdfWriter.getInstance(document, output);
            document.open();

            agregarEncabezado(document, reporte);
            agregarResumenEjecutivo(document, reporte.resumenEjecutivo());
            agregarSnapshot(document, reporte.snapshotControlCaja());
            agregarCarteraYRiesgo(document, reporte.carteraRiesgo());
            agregarMovimientos(document, reporte);
            agregarObservaciones(document, reporte.observaciones());

            document.close();
            return output.toByteArray();
        } catch (DocumentException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo generar el PDF del dashboard");
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error inesperado al generar el PDF del dashboard");
        }
    }

    private void agregarEncabezado(Document document, ReporteDashboardData reporte) throws DocumentException {
        Paragraph tituloReporte = new Paragraph("Resumen de control - CJ Préstamos", titulo);
        tituloReporte.setSpacingAfter(6f);
        document.add(tituloReporte);

        document.add(new Paragraph("Período: " + fecha(reporte.desde()) + " al " + fecha(reporte.hasta()), subtitulo));
        document.add(new Paragraph("Generado: " + fechaHora(reporte.generadoEn()), subtitulo));
        if (textoPresente(reporte.usuarioAutenticado())) {
            document.add(new Paragraph("Usuario: " + reporte.usuarioAutenticado(), subtitulo));
        }

        Paragraph separador = new Paragraph(" ");
        separador.setSpacingAfter(4f);
        document.add(separador);
    }

    private void agregarResumenEjecutivo(Document document, ReporteResumenEjecutivo resumen) throws DocumentException {
        agregarTituloSeccion(document, "1. Resumen ejecutivo del período");
        PdfPTable tabla = tablaClaveValor();
        agregarFilaClaveValor(tabla, "Ingresos del período", moneda(resumen.ingresosPeriodo()));
        agregarFilaClaveValor(tabla, "Egresos del período", moneda(resumen.egresosPeriodo()));
        agregarFilaClaveValor(tabla, "Balance del período", moneda(resumen.balancePeriodo()));
        agregarFilaClaveValor(tabla, "Pagos registrados", String.valueOf(resumen.cantidadPagosRegistrados()));
        agregarFilaClaveValor(tabla, "Préstamos otorgados", String.valueOf(resumen.cantidadPrestamosOtorgados()));
        agregarFilaClaveValor(tabla, "Monto total prestado", moneda(resumen.montoTotalPrestado()));
        agregarFilaClaveValor(tabla, "Monto promedio prestado", moneda(resumen.montoPromedioPrestado()));
        agregarFilaClaveValor(tabla, "Ticket promedio de pago", moneda(resumen.ticketPromedioPago()));
        document.add(tabla);
    }

    private void agregarSnapshot(Document document, DashboardControlCajaResponse snapshot) throws DocumentException {
        agregarTituloSeccion(document, "2. Snapshot económico actual");
        PdfPTable tabla = tablaClaveValor();
        agregarFilaClaveValor(tabla, "Caja disponible", moneda(snapshot.cajaDisponible()));
        agregarFilaClaveValor(tabla, "Inversión activa", moneda(snapshot.inversionActiva()));
        agregarFilaClaveValor(tabla, "Capital recuperado", moneda(snapshot.capitalRecuperado()));
        agregarFilaClaveValor(tabla, "Capital pendiente", moneda(snapshot.capitalPendiente()));
        agregarFilaClaveValor(tabla, "Ganancia realizada", moneda(snapshot.gananciaRealizada()));
        agregarFilaClaveValor(tabla, "Ganancia proyectada", moneda(snapshot.gananciaProyectada()));
        agregarFilaClaveValor(tabla, "Ingresos mes actual", moneda(snapshot.ingresosMesActual()));
        agregarFilaClaveValor(tabla, "Egresos mes actual", moneda(snapshot.egresosMesActual()));
        agregarFilaClaveValor(tabla, "Balance mes actual", moneda(snapshot.balanceMesActual()));
        agregarFilaClaveValor(tabla, "Proyección de cobro 30 días", moneda(snapshot.proyeccionCobro30Dias()));
        agregarFilaClaveValor(tabla, "Proyección de cobro 60 días", moneda(snapshot.proyeccionCobro60Dias()));
        agregarFilaClaveValor(tabla, "Proyección de cobro 90 días", moneda(snapshot.proyeccionCobro90Dias()));
        agregarFilaClaveValor(tabla, "Cartera en mora", moneda(snapshot.carteraEnMora()));
        agregarFilaClaveValor(tabla, "Cuotas pendientes", String.valueOf(snapshot.cuotasPendientes()));
        agregarFilaClaveValor(tabla, "Cuotas que vencen próximos 7 días", String.valueOf(snapshot.cuotasVencenProximos7Dias()));
        agregarFilaClaveValor(tabla, "% recupero capital", porcentaje(snapshot.recuperoCapitalPorcentaje()));
        agregarFilaClaveValor(tabla, "% rendimiento esperado", porcentaje(snapshot.rendimientoEsperadoPorcentaje()));
        document.add(tabla);
    }

    private void agregarCarteraYRiesgo(Document document, ReporteCarteraRiesgo riesgo) throws DocumentException {
        agregarTituloSeccion(document, "3. Cartera y riesgo");
        PdfPTable tabla = tablaClaveValor();
        agregarFilaClaveValor(tabla, "Cuotas pendientes al cierre", String.valueOf(riesgo.cuotasPendientesAlCierre()));
        agregarFilaClaveValor(tabla, "Cuotas vencidas al hasta", String.valueOf(riesgo.cuotasVencidasAlHasta()));
        agregarFilaClaveValor(tabla, "Monto total en mora al hasta", moneda(riesgo.montoTotalMoraAlHasta()));
        agregarFilaClaveValor(tabla, "Préstamos activos", String.valueOf(riesgo.prestamosActivos()));
        agregarFilaClaveValor(tabla, "Préstamos finalizados/cancelados", String.valueOf(riesgo.prestamosFinalizadosCancelados()));
        document.add(tabla);

        agregarSubtitulo(document, "Préstamos con mayor saldo pendiente (top 10)");
        PdfPTable tablaSaldos = tabla(new float[]{2.1f, 2.3f, 1.3f, 1.6f}, "Préstamo", "Persona", "Estado", "Saldo pendiente");
        if (riesgo.prestamosMayorSaldoPendiente().isEmpty()) {
            agregarFilaSinDatos(tablaSaldos, 4);
        } else {
            for (ReportePrestamoSaldo item : riesgo.prestamosMayorSaldoPendiente()) {
                tablaSaldos.addCell(celdaDato(item.referencia(), textoChico));
                tablaSaldos.addCell(celdaDato(item.persona(), textoChico));
                tablaSaldos.addCell(celdaDato(item.estado(), textoChico));
                tablaSaldos.addCell(celdaDato(moneda(item.saldoPendiente()), textoChico));
            }
        }
        document.add(tablaSaldos);

        agregarSubtitulo(document, "Cuotas vencidas más relevantes (top 10 por monto pendiente)");
        PdfPTable tablaCuotas = tabla(new float[]{1.3f, 1.8f, 2.0f, 0.9f, 1.6f}, "Vencimiento", "Préstamo", "Persona", "Cuota", "Pendiente");
        if (riesgo.cuotasVencidasRelevantes().isEmpty()) {
            agregarFilaSinDatos(tablaCuotas, 5);
        } else {
            for (ReporteCuotaVencida cuota : riesgo.cuotasVencidasRelevantes()) {
                tablaCuotas.addCell(celdaDato(fecha(cuota.fechaVencimiento()), textoChico));
                tablaCuotas.addCell(celdaDato(cuota.prestamoReferencia(), textoChico));
                tablaCuotas.addCell(celdaDato(cuota.persona(), textoChico));
                tablaCuotas.addCell(celdaDato(cuota.numeroCuota() == null ? "-" : cuota.numeroCuota().toString(), textoChico));
                tablaCuotas.addCell(celdaDato(moneda(cuota.montoPendiente()), textoChico));
            }
        }
        document.add(tablaCuotas);
    }

    private void agregarMovimientos(Document document, ReporteDashboardData reporte) throws DocumentException {
        agregarTituloSeccion(document, "4. Movimientos del período");
        agregarSubtitulo(document, "Préstamos otorgados en el período (hasta 20 registros)");
        PdfPTable tablaPrestamos = tabla(new float[]{1.2f, 1.8f, 2.1f, 1.4f, 0.8f, 1.2f},
            "Fecha base", "Referencia", "Persona", "Monto inicial", "Cuotas", "Estado");
        if (reporte.prestamosOtorgados().isEmpty()) {
            agregarFilaSinDatos(tablaPrestamos, 6);
        } else {
            for (ReporteMovimientoPrestamo prestamo : reporte.prestamosOtorgados()) {
                tablaPrestamos.addCell(celdaDato(fecha(prestamo.fechaBase()), textoChico));
                tablaPrestamos.addCell(celdaDato(prestamo.referencia(), textoChico));
                tablaPrestamos.addCell(celdaDato(prestamo.persona(), textoChico));
                tablaPrestamos.addCell(celdaDato(moneda(prestamo.montoInicial()), textoChico));
                tablaPrestamos.addCell(celdaDato(prestamo.cantidadCuotas() == null ? "-" : prestamo.cantidadCuotas().toString(), textoChico));
                tablaPrestamos.addCell(celdaDato(prestamo.estado(), textoChico));
            }
        }
        document.add(tablaPrestamos);

        agregarSubtitulo(document, "Pagos registrados en el período (hasta 20 registros)");
        PdfPTable tablaPagos = tabla(new float[]{1.2f, 2.3f, 2.0f, 1.3f, 1.1f},
            "Fecha", "Persona", "Préstamo", "Monto", "Estado");
        if (reporte.pagosRegistrados().isEmpty()) {
            agregarFilaSinDatos(tablaPagos, 5);
        } else {
            for (ReporteMovimientoPago pago : reporte.pagosRegistrados()) {
                tablaPagos.addCell(celdaDato(fecha(pago.fecha()), textoChico));
                tablaPagos.addCell(celdaDato(pago.persona(), textoChico));
                tablaPagos.addCell(celdaDato(pago.prestamoReferencia(), textoChico));
                tablaPagos.addCell(celdaDato(moneda(pago.monto()), textoChico));
                tablaPagos.addCell(celdaDato(pago.estado(), textoChico));
            }
        }
        document.add(tablaPagos);
    }

    private void agregarObservaciones(Document document, List<String> observaciones) throws DocumentException {
        agregarTituloSeccion(document, "5. Observaciones automáticas");
        if (observaciones == null || observaciones.isEmpty()) {
            document.add(new Paragraph("Sin observaciones automáticas relevantes para el período.", texto));
            return;
        }

        for (String observacion : observaciones) {
            Paragraph item = new Paragraph("- " + textoSeguro(observacion), texto);
            item.setSpacingAfter(3f);
            document.add(item);
        }
    }

    private void agregarTituloSeccion(Document document, String textoSeccion) throws DocumentException {
        Paragraph paragraph = new Paragraph(textoSeccion, seccion);
        paragraph.setSpacingBefore(10f);
        paragraph.setSpacingAfter(6f);
        document.add(paragraph);
    }

    private void agregarSubtitulo(Document document, String valor) throws DocumentException {
        Paragraph paragraph = new Paragraph(valor, textoNegrita);
        paragraph.setSpacingBefore(8f);
        paragraph.setSpacingAfter(4f);
        document.add(paragraph);
    }

    private PdfPTable tablaClaveValor() throws DocumentException {
        PdfPTable tabla = tabla(new float[]{2.8f, 2.0f}, "Indicador", "Valor");
        tabla.setSpacingAfter(5f);
        return tabla;
    }

    private void agregarFilaClaveValor(PdfPTable tabla, String clave, String valor) {
        tabla.addCell(celdaDato(clave, texto));
        tabla.addCell(celdaDato(valor, textoNegrita));
    }

    private PdfPTable tabla(float[] widths, String... headers) throws DocumentException {
        PdfPTable tabla = new PdfPTable(headers.length);
        tabla.setWidthPercentage(100);
        tabla.setWidths(widths);
        tabla.setHeaderRows(1);
        tabla.setSpacingAfter(6f);

        for (String header : headers) {
            tabla.addCell(celdaHeader(header));
        }

        return tabla;
    }

    private PdfPCell celdaHeader(String valor) {
        PdfPCell cell = new PdfPCell(new Phrase(textoSeguro(valor), headerTabla));
        cell.setBackgroundColor(AZUL_HEADER);
        cell.setBorderColor(new Color(191, 219, 254));
        cell.setPadding(5f);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        return cell;
    }

    private PdfPCell celdaDato(String valor, Font fuente) {
        PdfPCell cell = new PdfPCell(new Phrase(textoSeguro(valor), fuente));
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(BORDE);
        cell.setPadding(5f);
        cell.setUseBorderPadding(true);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        return cell;
    }

    private void agregarFilaSinDatos(PdfPTable tabla, int columnas) {
        PdfPCell cell = celdaDato("Sin datos para el período", texto);
        cell.setColspan(columnas);
        tabla.addCell(cell);
    }

    private String moneda(BigDecimal valor) {
        NumberFormat formato = NumberFormat.getCurrencyInstance(ARGENTINA);
        formato.setMinimumFractionDigits(0);
        formato.setMaximumFractionDigits(0);
        BigDecimal seguro = valor == null ? BigDecimal.ZERO : valor;
        return formato.format(seguro.setScale(0, RoundingMode.CEILING));
    }

    private String porcentaje(BigDecimal valor) {
        NumberFormat formato = NumberFormat.getNumberInstance(ARGENTINA);
        formato.setMinimumFractionDigits(0);
        formato.setMaximumFractionDigits(2);
        BigDecimal seguro = valor == null ? BigDecimal.ZERO : valor;
        return formato.format(seguro) + "%";
    }

    private String fecha(LocalDate valor) {
        return valor == null ? "Sin fecha" : valor.format(FECHA_FORMATO);
    }

    private String fechaHora(LocalDateTime valor) {
        return valor == null ? "Sin fecha" : valor.format(FECHA_HORA_FORMATO);
    }

    private String textoSeguro(String valor) {
        if (!textoPresente(valor)) {
            return "-";
        }

        return valor.trim();
    }

    private boolean textoPresente(String valor) {
        return valor != null && !valor.trim().isEmpty();
    }
}
