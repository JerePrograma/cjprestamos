package com.cjprestamos.backend.prestamo.service;

import com.cjprestamos.backend.common.model.MonedaUtils;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoEntrada;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import com.cjprestamos.backend.prestamo.dto.SimulacionCuotaResponse;
import com.cjprestamos.backend.prestamo.dto.SimulacionPrestamoRequest;
import com.cjprestamos.backend.prestamo.dto.SimulacionPrestamoResponse;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.IntStream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SimuladorPrestamoService {

    private static final DateTimeFormatter FECHA_FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final CalculadoraPrestamoService calculadoraPrestamoService;

    public SimuladorPrestamoService(CalculadoraPrestamoService calculadoraPrestamoService) {
        this.calculadoraPrestamoService = calculadoraPrestamoService;
    }

    public SimulacionPrestamoResponse simular(SimulacionPrestamoRequest request) {
        validarRequest(request);

        CalculoPrestamoResultado calculo = calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
            request.montoInicial(),
            request.porcentajeFijoSugerido(),
            request.interesManualOpcional(),
            request.cantidadCuotas()
        ));

        List<BigDecimal> montosCuotas = distribuirMontos(request.cantidadCuotas(), calculo.totalADevolver());
        List<SimulacionCuotaResponse> cuotas = IntStream.rangeClosed(1, request.cantidadCuotas())
            .mapToObj(numero -> new SimulacionCuotaResponse(
                numero,
                calcularFecha(request, numero),
                montosCuotas.get(numero - 1)
            ))
            .toList();

        return new SimulacionPrestamoResponse(
            MonedaUtils.normalizar(calculo.montoInvertido()),
            MonedaUtils.normalizar(calculo.interesAplicado()),
            MonedaUtils.normalizar(calculo.totalADevolver()),
            MonedaUtils.normalizar(calculo.cuotaSugerida()),
            request.cantidadCuotas(),
            cuotas
        );
    }

    public byte[] generarPdfSimulacion(SimulacionPrestamoRequest request) {
        SimulacionPrestamoResponse simulacion = simular(request);

        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, output);
            document.open();

            Font marca = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 19, new Color(31, 41, 55));
            Font titulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(30, 64, 175));
            Font subtitulo = FontFactory.getFont(FontFactory.HELVETICA, 11, new Color(71, 85, 105));
            Font valorResumen = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(15, 23, 42));

            document.add(new Paragraph("CJPrestamos", marca));
            document.add(new Paragraph("Simulación de préstamo", titulo));
            document.add(new Paragraph("Generado: " + LocalDate.now().format(FECHA_FORMATO), subtitulo));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Monto inicial: $" + simulacion.montoInicial(), valorResumen));
            document.add(new Paragraph("Interés aplicado: $" + simulacion.interesAplicado(), valorResumen));
            document.add(new Paragraph("Total a devolver: $" + simulacion.totalADevolver(), valorResumen));
            document.add(new Paragraph("Cantidad de cuotas: " + simulacion.cantidadCuotas(), subtitulo));
            document.add(new Paragraph(" "));

            PdfPTable tabla = new PdfPTable(3);
            tabla.setWidthPercentage(100);
            tabla.setWidths(new float[]{1.3f, 2.2f, 2.2f});
            tabla.addCell(celdaHeader("#"));
            tabla.addCell(celdaHeader("Vencimiento"));
            tabla.addCell(celdaHeader("Monto"));

            Font textoCelda = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(30, 41, 59));
            for (SimulacionCuotaResponse cuota : simulacion.cuotas()) {
                tabla.addCell(celdaDato(cuota.numeroCuota().toString(), textoCelda));
                tabla.addCell(celdaDato(cuota.fechaVencimiento() == null ? "A definir" : cuota.fechaVencimiento().format(FECHA_FORMATO), textoCelda));
                tabla.addCell(celdaDato("$" + cuota.montoProgramado(), textoCelda));
            }

            document.add(tabla);
            document.close();
            return output.toByteArray();
        } catch (DocumentException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo generar el PDF de simulación");
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error inesperado al generar el PDF");
        }
    }

    private PdfPCell celdaHeader(String texto) {
        PdfPCell cell = new PdfPCell();
        cell.setPhrase(new com.lowagie.text.Phrase(texto, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
        cell.setBackgroundColor(new Color(59, 130, 246));
        cell.setBorderColor(new Color(191, 219, 254));
        cell.setPadding(7f);
        return cell;
    }

    private PdfPCell celdaDato(String texto, Font fuente) {
        PdfPCell cell = new PdfPCell();
        cell.setPhrase(new com.lowagie.text.Phrase(texto, fuente));
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setPadding(6f);
        cell.setUseBorderPadding(true);
        cell.setBorder(Rectangle.BOX);
        return cell;
    }

    private void validarRequest(SimulacionPrestamoRequest request) {
        if (request.frecuenciaTipo() == FrecuenciaTipo.CADA_X_DIAS
            && (request.frecuenciaCadaDias() == null || request.frecuenciaCadaDias() <= 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "frecuenciaCadaDias debe ser mayor que 0 para CADA_X_DIAS");
        }

        if (request.frecuenciaTipo() != FrecuenciaTipo.FECHAS_MANUALES && request.fechaPrimerVencimiento() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fechaPrimerVencimiento es obligatoria para simulaciones automáticas");
        }
    }

    private LocalDate calcularFecha(SimulacionPrestamoRequest request, int numeroCuota) {
        if (request.frecuenciaTipo() == FrecuenciaTipo.FECHAS_MANUALES || request.fechaPrimerVencimiento() == null) {
            return null;
        }

        if (request.frecuenciaTipo() == FrecuenciaTipo.CADA_X_DIAS) {
            return request.fechaPrimerVencimiento().plusDays((long) (numeroCuota - 1) * request.frecuenciaCadaDias());
        }

        return request.fechaPrimerVencimiento().plusMonths(numeroCuota - 1L);
    }

    private List<BigDecimal> distribuirMontos(Integer cantidadCuotas, BigDecimal totalADevolver) {
        long totalPesos = MonedaUtils.normalizar(totalADevolver).longValueExact();
        long montoBase = totalPesos / cantidadCuotas;
        long resto = totalPesos % cantidadCuotas;

        return IntStream.range(0, cantidadCuotas)
            .mapToObj(indice -> MonedaUtils.normalizar(BigDecimal.valueOf(montoBase + (indice < resto ? 1 : 0))))
            .toList();
    }
}
