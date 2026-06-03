package com.cjprestamos.backend.reporte.service;

import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import com.cjprestamos.backend.dashboard.dto.ProyeccionCobroPeriodoResponse;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCarteraRiesgo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCobrosEsperadosPeriodo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCuotaACobrar;
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
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
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
    private static final Color AZUL_SECCION = new Color(30, 64, 175);
    private static final Color BORDE = new Color(226, 232, 240);
    private static final Color FONDO_SUAVE = new Color(248, 250, 252);
    private static final Color TEXTO_PRINCIPAL = new Color(15, 23, 42);
    private static final Color TEXTO_SUAVE = new Color(71, 85, 105);

    private final Font titulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, AZUL_OSCURO);
    private final Font subtitulo = FontFactory.getFont(FontFactory.HELVETICA, 10, TEXTO_SUAVE);
    private final Font seccion = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, AZUL_SECCION);
    private final Font texto = FontFactory.getFont(FontFactory.HELVETICA, 9, TEXTO_PRINCIPAL);
    private final Font textoChico = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXTO_PRINCIPAL);
    private final Font textoMini = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, TEXTO_PRINCIPAL);
    private final Font textoNegrita = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, TEXTO_PRINCIPAL);
    private final Font textoChicoNegrita = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, TEXTO_PRINCIPAL);
    private final Font headerTabla = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);

    public byte[] generarPdf(ReporteDashboardData reporte) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 32, 32, 32, 42);
            PdfWriter writer = PdfWriter.getInstance(document, output);

            writer.setPageEvent(new FooterEvento(
                    "CJ Préstamos - Reporte de control",
                    "Período: " + fecha(reporte.desde()) + " - " + fecha(reporte.hasta())
            ));

            document.open();

            agregarEncabezado(document, reporte);
            agregarComoLeerReporte(document);
            agregarLecturaRapidaCaja(document, reporte.resumenEjecutivo(), reporte.cobrosEsperadosPeriodo());
            agregarCobrosEsperadosPeriodo(document, reporte.cobrosEsperadosPeriodo());
            agregarFotoActualNegocio(document, reporte.snapshotControlCaja());
            agregarDeudasPendientesYAtrasos(document, reporte.carteraRiesgo());
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
        tituloReporte.setSpacingAfter(8f);
        document.add(tituloReporte);

        PdfPTable metadata = new PdfPTable(2);
        metadata.setWidthPercentage(100);
        metadata.setWidths(new float[]{1.2f, 2.8f});
        metadata.setSpacingAfter(10f);
        metadata.setKeepTogether(true);

        agregarFilaMetadata(metadata, "Período", fecha(reporte.desde()) + " al " + fecha(reporte.hasta()));
        agregarFilaMetadata(metadata, "Generado", fechaHora(reporte.generadoEn()));

        if (textoPresente(reporte.usuarioAutenticado())) {
            agregarFilaMetadata(metadata, "Usuario", reporte.usuarioAutenticado());
        }

        document.add(metadata);
    }

    private void agregarComoLeerReporte(Document document) throws DocumentException {
        agregarTituloSeccion(document, "1. Cómo leer este reporte");

        PdfPTable bloque = new PdfPTable(1);
        bloque.setWidthPercentage(100);
        bloque.setSpacingAfter(7f);
        bloque.setKeepTogether(true);

        bloque.addCell(celdaBloque(
                "Este documento separa movimientos reales de planificación. " +
                        "El dinero cobrado y el dinero prestado muestran caja real del período. " +
                        "Los cobros esperados muestran cuotas con vencimiento dentro del rango elegido.",
                texto
        ));

        document.add(bloque);

        agregarBullet(document, "Dinero cobrado: pagos registrados entre las fechas elegidas.");
        agregarBullet(document, "Dinero prestado: préstamos creados entre las fechas elegidas.");
        agregarBullet(document, "Diferencia: cobrado menos prestado. Sirve para mirar movimiento de caja, no ganancia final.");
        agregarBullet(document, "Cobros esperados: cuotas que vencen dentro del período elegido.");
        agregarBullet(document, "Atrasos: cuotas que ya deberían estar pagadas y todavía tienen saldo pendiente.");
    }

    private void agregarLecturaRapidaCaja(
            Document document,
            ReporteResumenEjecutivo resumen,
            ReporteCobrosEsperadosPeriodo cobrosEsperadosPeriodo
    ) throws DocumentException {
        agregarTituloSeccion(document, "2. Lectura rápida de caja");

        PdfPTable movimientoReal = tablaClaveValor("Movimiento real", "Valor");
        agregarFilaClaveValor(movimientoReal, "Dinero que entró en el período", moneda(resumen.ingresosPeriodo()));
        agregarFilaClaveValor(movimientoReal, "Dinero que salió en el período", moneda(resumen.egresosPeriodo()));
        agregarFilaClaveValor(movimientoReal, "Resultado del período", moneda(resumen.balancePeriodo()));
        document.add(movimientoReal);

        PdfPTable planificacion = tablaClaveValor("Planificación del período", "Valor");
        agregarFilaClaveValor(planificacion, "Cobros esperados del período", moneda(cobrosEsperadosPeriodo.totalEsperado()));
        agregarFilaClaveValor(planificacion, "Cobros pendientes del período", moneda(cobrosEsperadosPeriodo.totalPendiente()));
        agregarFilaClaveValor(planificacion, "Pagos registrados", String.valueOf(resumen.cantidadPagosRegistrados()));
        agregarFilaClaveValor(planificacion, "Préstamos otorgados", String.valueOf(resumen.cantidadPrestamosOtorgados()));
        agregarFilaClaveValor(planificacion, "Monto total prestado", moneda(resumen.montoTotalPrestado()));
        agregarFilaClaveValor(planificacion, "Monto promedio prestado", moneda(resumen.montoPromedioPrestado()));
        agregarFilaClaveValor(planificacion, "Pago promedio", moneda(resumen.ticketPromedioPago()));
        document.add(planificacion);

        PdfPTable lectura = new PdfPTable(1);
        lectura.setWidthPercentage(100);
        lectura.setSpacingBefore(3f);
        lectura.setSpacingAfter(7f);
        lectura.setKeepTogether(true);

        String resultadoTexto;

        if (resumen.balancePeriodo().compareTo(BigDecimal.ZERO) > 0) {
            resultadoTexto = "En este período entró más dinero del que salió.";
        } else if (resumen.balancePeriodo().compareTo(BigDecimal.ZERO) < 0) {
            resultadoTexto = "En este período salió más dinero del que entró.";
        } else {
            resultadoTexto = "En este período entró y salió el mismo monto.";
        }

        lectura.addCell(celdaBloque(resultadoTexto, textoNegrita));
        lectura.addCell(celdaBloque(
                "El resultado del período no es ganancia pura. Es una comparación simple entre cobros registrados y dinero prestado.",
                texto
        ));

        document.add(lectura);
    }

    private void agregarCobrosEsperadosPeriodo(Document document, ReporteCobrosEsperadosPeriodo cobros) throws DocumentException {
        agregarTituloSeccion(document, "3. Cobros esperados dentro del período");

        PdfPTable tabla = tablaClaveValor("Indicador", "Valor");
        agregarFilaClaveValor(tabla, "Total esperado a cobrar en el período", moneda(cobros.totalEsperado()));
        agregarFilaClaveValor(tabla, "Total ya pagado sobre esas cuotas", moneda(cobros.totalPagado()));
        agregarFilaClaveValor(tabla, "Total pendiente de esas cuotas", moneda(cobros.totalPendiente()));
        agregarFilaClaveValor(tabla, "Cantidad de cuotas que vencen en el período", String.valueOf(cobros.cantidadCuotas()));
        agregarFilaClaveValor(tabla, "Cuotas ya pagadas/completas", String.valueOf(cobros.cantidadCuotasCompletas()));
        agregarFilaClaveValor(tabla, "Cuotas con saldo pendiente", String.valueOf(cobros.cantidadCuotasPendientes()));
        document.add(tabla);

        agregarSubtitulo(document, "Cuotas a cobrar en el período");

        PdfPTable tablaCuotas = tablaLarga(
                new float[]{1.05f, 1.55f, 1.45f, 0.65f, 1.15f, 1.05f, 1.15f, 0.95f},
                "Vencimiento", "Persona", "Préstamo", "Cuota", "Total", "Pagado", "Pendiente", "Estado"
        );

        if (cobros.cuotasACobrar().isEmpty()) {
            agregarFilaMensaje(tablaCuotas, 8, "No hay cuotas con vencimiento dentro del período seleccionado.");
        } else {
            for (ReporteCuotaACobrar cuota : cobros.cuotasACobrar()) {
                tablaCuotas.addCell(celdaTexto(fecha(cuota.fechaVencimiento()), textoMini));
                tablaCuotas.addCell(celdaTexto(cuota.persona(), textoMini));
                tablaCuotas.addCell(celdaTexto(cuota.prestamoReferencia(), textoMini));
                tablaCuotas.addCell(celdaCentro(cuota.numeroCuota() == null ? "-" : cuota.numeroCuota().toString(), textoMini));
                tablaCuotas.addCell(celdaImporte(cuota.montoEsperado(), textoMini));
                tablaCuotas.addCell(celdaImporte(cuota.montoPagado(), textoMini));
                tablaCuotas.addCell(celdaImporte(cuota.montoPendiente(), textoMini));
                tablaCuotas.addCell(celdaTexto(cuota.estadoSimple(), textoMini));
            }

            agregarFilaTotalCobrosEsperados(tablaCuotas, cobros);
        }

        document.add(tablaCuotas);
    }

    private void agregarFotoActualNegocio(Document document, DashboardControlCajaResponse snapshot) throws DocumentException {
        agregarTituloSeccion(document, "4. Foto actual del negocio");

        PdfPTable capital = tablaClaveValor("Capital y recupero", "Valor");
        agregarFilaClaveValor(capital, "Caja disponible", moneda(snapshot.cajaDisponible()));
        agregarFilaClaveValor(capital, "Inversión activa", moneda(snapshot.inversionActiva()));
        agregarFilaClaveValor(capital, "Capital recuperado", moneda(snapshot.capitalRecuperado()));
        agregarFilaClaveValor(capital, "Capital pendiente", moneda(snapshot.capitalPendiente()));
        document.add(capital);

        PdfPTable ganancias = tablaClaveValor("Ganancias y mes actual", "Valor");
        agregarFilaClaveValor(ganancias, "Ganancia ya cobrada", moneda(snapshot.gananciaRealizada()));
        agregarFilaClaveValor(ganancias, "Ganancia estimada pendiente", moneda(snapshot.gananciaProyectada()));
        agregarFilaClaveValor(ganancias, "Dinero cobrado mes actual", moneda(snapshot.ingresosMesActual()));
        agregarFilaClaveValor(ganancias, "Dinero prestado mes actual", moneda(snapshot.egresosMesActual()));
        agregarFilaClaveValor(ganancias, "Diferencia mes actual", moneda(snapshot.balanceMesActual()));
        document.add(ganancias);

        PdfPTable proyeccion = tablaClaveValor("Proyección y pendientes", "Valor");

        agregarFilasProyeccionCobro(proyeccion, snapshot.proyeccionesCobro());

        agregarFilaClaveValor(proyeccion, "Total atrasado actual", moneda(snapshot.carteraEnMora()));
        agregarFilaClaveValor(proyeccion, "Cuotas todavía pendientes", String.valueOf(snapshot.cuotasPendientes()));
        agregarFilaClaveValor(proyeccion, "Cuotas que vencen próximos 7 días", String.valueOf(snapshot.cuotasVencenProximos7Dias()));
        agregarFilaClaveValor(proyeccion, "% de capital recuperado", porcentaje(snapshot.recuperoCapitalPorcentaje()));
        agregarFilaClaveValor(proyeccion, "% de rendimiento estimado", porcentaje(snapshot.rendimientoEsperadoPorcentaje()));

        document.add(proyeccion);
    }

    private void agregarFilasProyeccionCobro(
            PdfPTable tabla,
            List<ProyeccionCobroPeriodoResponse> proyeccionesCobro
    ) {
        if (proyeccionesCobro == null || proyeccionesCobro.isEmpty()) {
            agregarFilaClaveValor(tabla, "Cobros estimados por período", moneda(BigDecimal.ZERO));
            return;
        }

        for (ProyeccionCobroPeriodoResponse periodo : proyeccionesCobro) {
            String etiqueta = periodo.etiqueta() + " (" + fecha(periodo.desde()) + " al " + fecha(periodo.hasta()) + ")";
            agregarFilaClaveValor(tabla, "Cobro estimado - " + etiqueta, moneda(periodo.monto()));
        }
    }

    private void agregarDeudasPendientesYAtrasos(Document document, ReporteCarteraRiesgo riesgo) throws DocumentException {
        agregarTituloSeccion(document, "5. Deudas pendientes y atrasos");

        PdfPTable tabla = tablaClaveValor("Indicador", "Valor");
        agregarFilaClaveValor(tabla, "Cuotas todavía pendientes al cierre", String.valueOf(riesgo.cuotasPendientesAlCierre()));
        agregarFilaClaveValor(tabla, "Cuotas atrasadas al cierre del período", String.valueOf(riesgo.cuotasVencidasAlHasta()));
        agregarFilaClaveValor(tabla, "Total atrasado al cierre del período", moneda(riesgo.montoTotalMoraAlHasta()));
        agregarFilaClaveValor(tabla, "Préstamos activos", String.valueOf(riesgo.prestamosActivos()));
        agregarFilaClaveValor(tabla, "Préstamos finalizados/cancelados", String.valueOf(riesgo.prestamosFinalizadosCancelados()));
        document.add(tabla);

        agregarSubtitulo(document, "Préstamos con mayor saldo pendiente (hasta 10)");

        PdfPTable tablaSaldos = tablaLarga(
                new float[]{2.1f, 2.3f, 1.3f, 1.6f},
                "Préstamo", "Persona", "Estado", "Saldo pendiente"
        );

        if (riesgo.prestamosMayorSaldoPendiente().isEmpty()) {
            agregarFilaSinDatos(tablaSaldos, 4);
        } else {
            for (ReportePrestamoSaldo item : riesgo.prestamosMayorSaldoPendiente()) {
                tablaSaldos.addCell(celdaTexto(item.referencia(), textoChico));
                tablaSaldos.addCell(celdaTexto(item.persona(), textoChico));
                tablaSaldos.addCell(celdaTexto(item.estado(), textoChico));
                tablaSaldos.addCell(celdaImporte(item.saldoPendiente(), textoChico));
            }
        }

        document.add(tablaSaldos);

        agregarSubtitulo(document, "Cuotas atrasadas más relevantes (hasta 10 por monto pendiente)");

        PdfPTable tablaCuotas = tablaLarga(
                new float[]{1.3f, 1.8f, 2.0f, 0.9f, 1.6f},
                "Vencimiento", "Préstamo", "Persona", "Cuota", "Pendiente"
        );

        if (riesgo.cuotasVencidasRelevantes().isEmpty()) {
            agregarFilaSinDatos(tablaCuotas, 5);
        } else {
            for (ReporteCuotaVencida cuota : riesgo.cuotasVencidasRelevantes()) {
                tablaCuotas.addCell(celdaTexto(fecha(cuota.fechaVencimiento()), textoChico));
                tablaCuotas.addCell(celdaTexto(cuota.prestamoReferencia(), textoChico));
                tablaCuotas.addCell(celdaTexto(cuota.persona(), textoChico));
                tablaCuotas.addCell(celdaCentro(cuota.numeroCuota() == null ? "-" : cuota.numeroCuota().toString(), textoChico));
                tablaCuotas.addCell(celdaImporte(cuota.montoPendiente(), textoChico));
            }
        }

        document.add(tablaCuotas);
    }

    private void agregarMovimientos(Document document, ReporteDashboardData reporte) throws DocumentException {
        agregarTituloSeccion(document, "6. Movimientos del período");

        agregarSubtitulo(document, "Dinero prestado en el período (hasta 20 registros)");

        PdfPTable tablaPrestamos = tablaLarga(
                new float[]{1.2f, 1.8f, 2.1f, 1.4f, 0.8f, 1.2f},
                "Fecha base", "Referencia", "Persona", "Monto inicial", "Cuotas", "Estado"
        );

        if (reporte.prestamosOtorgados().isEmpty()) {
            agregarFilaSinDatos(tablaPrestamos, 6);
        } else {
            for (ReporteMovimientoPrestamo prestamo : reporte.prestamosOtorgados()) {
                tablaPrestamos.addCell(celdaTexto(fecha(prestamo.fechaBase()), textoChico));
                tablaPrestamos.addCell(celdaTexto(prestamo.referencia(), textoChico));
                tablaPrestamos.addCell(celdaTexto(prestamo.persona(), textoChico));
                tablaPrestamos.addCell(celdaImporte(prestamo.montoInicial(), textoChico));
                tablaPrestamos.addCell(celdaCentro(prestamo.cantidadCuotas() == null ? "-" : prestamo.cantidadCuotas().toString(), textoChico));
                tablaPrestamos.addCell(celdaTexto(prestamo.estado(), textoChico));
            }
        }

        document.add(tablaPrestamos);

        agregarSubtitulo(document, "Dinero cobrado en el período (hasta 20 registros)");

        PdfPTable tablaPagos = tablaLarga(
                new float[]{1.2f, 2.3f, 2.0f, 1.3f, 1.1f},
                "Fecha", "Persona", "Préstamo", "Monto", "Estado"
        );

        if (reporte.pagosRegistrados().isEmpty()) {
            agregarFilaSinDatos(tablaPagos, 5);
        } else {
            for (ReporteMovimientoPago pago : reporte.pagosRegistrados()) {
                tablaPagos.addCell(celdaTexto(fecha(pago.fecha()), textoChico));
                tablaPagos.addCell(celdaTexto(pago.persona(), textoChico));
                tablaPagos.addCell(celdaTexto(pago.prestamoReferencia(), textoChico));
                tablaPagos.addCell(celdaImporte(pago.monto(), textoChico));
                tablaPagos.addCell(celdaTexto(pago.estado(), textoChico));
            }
        }

        document.add(tablaPagos);
    }

    private void agregarObservaciones(Document document, List<String> observaciones) throws DocumentException {
        agregarTituloSeccion(document, "7. Observaciones automáticas");

        if (observaciones == null || observaciones.isEmpty()) {
            document.add(new Paragraph("Sin observaciones automáticas relevantes para el período.", texto));
            return;
        }

        for (String observacion : observaciones) {
            agregarBullet(document, textoSeguro(observacion));
        }
    }

    private void agregarTituloSeccion(Document document, String textoSeccion) throws DocumentException {
        Paragraph paragraph = new Paragraph(textoSeccion, seccion);
        paragraph.setSpacingBefore(11f);
        paragraph.setSpacingAfter(6f);
        document.add(paragraph);
    }

    private void agregarSubtitulo(Document document, String valor) throws DocumentException {
        Paragraph paragraph = new Paragraph(valor, textoNegrita);
        paragraph.setSpacingBefore(8f);
        paragraph.setSpacingAfter(4f);
        document.add(paragraph);
    }

    private void agregarBullet(Document document, String valor) throws DocumentException {
        Paragraph paragraph = new Paragraph("• " + textoSeguro(valor), texto);
        paragraph.setIndentationLeft(8f);
        paragraph.setFirstLineIndent(-6f);
        paragraph.setSpacingAfter(2.5f);
        document.add(paragraph);
    }

    private PdfPTable tablaClaveValor() throws DocumentException {
        return tablaClaveValor("Indicador", "Valor");
    }

    private PdfPTable tablaClaveValor(String headerClave, String headerValor) throws DocumentException {
        PdfPTable tabla = new PdfPTable(2);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[]{2.8f, 2.0f});
        tabla.setHeaderRows(1);
        tabla.setSpacingAfter(7f);
        tabla.setKeepTogether(true);

        tabla.addCell(celdaHeader(headerClave));
        tabla.addCell(celdaHeader(headerValor));

        return tabla;
    }

    private PdfPTable tablaLarga(float[] widths, String... headers) throws DocumentException {
        PdfPTable tabla = new PdfPTable(headers.length);
        tabla.setWidthPercentage(100);
        tabla.setWidths(widths);
        tabla.setHeaderRows(1);
        tabla.setSpacingAfter(7f);
        tabla.setSplitLate(false);
        tabla.setSplitRows(true);

        for (String header : headers) {
            tabla.addCell(celdaHeader(header));
        }

        return tabla;
    }

    private void agregarFilaMetadata(PdfPTable tabla, String clave, String valor) {
        PdfPCell celdaClave = celdaDatoAlineada(clave, textoChicoNegrita, Element.ALIGN_LEFT);
        celdaClave.setBackgroundColor(FONDO_SUAVE);

        PdfPCell celdaValor = celdaDatoAlineada(valor, textoChico, Element.ALIGN_LEFT);
        celdaValor.setBackgroundColor(FONDO_SUAVE);

        tabla.addCell(celdaClave);
        tabla.addCell(celdaValor);
    }

    private void agregarFilaClaveValor(PdfPTable tabla, String clave, String valor) {
        tabla.addCell(celdaDatoAlineada(clave, texto, Element.ALIGN_LEFT));
        tabla.addCell(celdaDatoAlineada(valor, textoNegrita, Element.ALIGN_RIGHT));
    }

    private PdfPCell celdaHeader(String valor) {
        PdfPCell cell = new PdfPCell(new Phrase(textoSeguro(valor), headerTabla));
        cell.setBackgroundColor(AZUL_HEADER);
        cell.setBorderColor(new Color(191, 219, 254));
        cell.setPadding(5f);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private PdfPCell celdaTexto(String valor, Font fuente) {
        return celdaDatoAlineada(valor, fuente, Element.ALIGN_LEFT);
    }

    private PdfPCell celdaCentro(String valor, Font fuente) {
        return celdaDatoAlineada(valor, fuente, Element.ALIGN_CENTER);
    }

    private PdfPCell celdaImporte(BigDecimal valor, Font fuente) {
        return celdaDatoAlineada(moneda(valor), fuente, Element.ALIGN_RIGHT);
    }

    private PdfPCell celdaBloque(String valor, Font fuente) {
        PdfPCell cell = new PdfPCell(new Phrase(textoSeguro(valor), fuente));
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(BORDE);
        cell.setBackgroundColor(FONDO_SUAVE);
        cell.setPadding(6f);
        cell.setUseBorderPadding(true);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private PdfPCell celdaDatoAlineada(String valor, Font fuente, int alineacion) {
        PdfPCell cell = new PdfPCell(new Phrase(textoSeguro(valor), fuente));
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(BORDE);
        cell.setPadding(4.5f);
        cell.setUseBorderPadding(true);
        cell.setHorizontalAlignment(alineacion);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private void agregarFilaSinDatos(PdfPTable tabla, int columnas) {
        agregarFilaMensaje(tabla, columnas, "Sin datos para el período");
    }

    private void agregarFilaMensaje(PdfPTable tabla, int columnas, String mensaje) {
        PdfPCell cell = celdaDatoAlineada(mensaje, texto, Element.ALIGN_LEFT);
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

    private static String fecha(LocalDate valor) {
        return valor == null ? "Sin fecha" : valor.format(FECHA_FORMATO);
    }

    private static String fechaHora(LocalDateTime valor) {
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

    private static class FooterEvento extends PdfPageEventHelper {

        private static final Font FOOTER_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXTO_SUAVE);

        private final String titulo;
        private final String periodo;

        private FooterEvento(String titulo, String periodo) {
            this.titulo = titulo;
            this.periodo = periodo;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            float y = document.bottom() - 18f;

            ColumnText.showTextAligned(
                    writer.getDirectContent(),
                    Element.ALIGN_LEFT,
                    new Phrase(titulo, FOOTER_FONT),
                    document.left(),
                    y,
                    0
            );

            ColumnText.showTextAligned(
                    writer.getDirectContent(),
                    Element.ALIGN_CENTER,
                    new Phrase(periodo, FOOTER_FONT),
                    (document.left() + document.right()) / 2,
                    y,
                    0
            );

            ColumnText.showTextAligned(
                    writer.getDirectContent(),
                    Element.ALIGN_RIGHT,
                    new Phrase("Página " + writer.getPageNumber(), FOOTER_FONT),
                    document.right(),
                    y,
                    0
            );
        }
    }

    private void agregarFilaTotalCobrosEsperados(PdfPTable tabla, ReporteCobrosEsperadosPeriodo cobros) {
        PdfPCell totalLabel = celdaDatoAlineada("TOTAL DEL PERÍODO", textoChicoNegrita, Element.ALIGN_RIGHT);
        totalLabel.setColspan(4);
        totalLabel.setBackgroundColor(FONDO_SUAVE);

        PdfPCell totalEsperado = celdaImporte(cobros.totalEsperado(), textoChicoNegrita);
        totalEsperado.setBackgroundColor(FONDO_SUAVE);

        PdfPCell totalPagado = celdaImporte(cobros.totalPagado(), textoChicoNegrita);
        totalPagado.setBackgroundColor(FONDO_SUAVE);

        PdfPCell totalPendiente = celdaImporte(cobros.totalPendiente(), textoChicoNegrita);
        totalPendiente.setBackgroundColor(FONDO_SUAVE);

        PdfPCell estado = celdaDatoAlineada(
                cobros.totalPendiente().compareTo(BigDecimal.ZERO) > 0 ? "Pendiente" : "Completo",
                textoChicoNegrita,
                Element.ALIGN_LEFT
        );
        estado.setBackgroundColor(FONDO_SUAVE);

        tabla.addCell(totalLabel);
        tabla.addCell(totalEsperado);
        tabla.addCell(totalPagado);
        tabla.addCell(totalPendiente);
        tabla.addCell(estado);
    }
}