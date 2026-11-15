package customer.ui5app.BirtReportGenerator;

import java.util.Base64;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class BirtReportController {
    private final BirtReportService birtReportService;

    BirtReportController(BirtReportService birtReportService) {
        this.birtReportService = birtReportService;
    }

    @PostMapping("/generate")
    public String generateSimpleReport() {
        birtReportService.generateSimplePdfReport();
        return "Report generated in Downloads folder.";
    }

    @PostMapping("/base_report")
    public ResponseEntity<String> generateReport() {
        try {
            String base64Pdf = birtReportService.generateBaseString();
            return ResponseEntity.ok(base64Pdf);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate report: " + e.getMessage());
        }
    }

    // // Generic Birt Screen
    // @PostMapping("/generate_with_json_object")
    // public ResponseEntity<String> generateWithJsonObject(
    // @RequestParam("folderPath") String folderPath,
    // @RequestParam("reportName") String reportName,
    // @RequestParam("contextName") String contextName,
    // @RequestBody Map<String, Object> payload) {
    // try {
    // byte[] pdfBytes = birtReportService.generateWithJsonObject(folderPath,
    // reportName, contextName, payload);
    // HttpHeaders headers = new HttpHeaders();
    // headers.setContentType(MediaType.APPLICATION_PDF);
    // headers.setContentDispositionFormData("inline", "report.pdf");
    // // return ResponseEntity.ok().headers(headers).body(pdfBytes);

    // String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);
    // return ResponseEntity.ok().body(base64Pdf);

    // } catch (Exception e) {
    // return ResponseEntity.internalServerError().body(null);

    // }
    // }

    @PostMapping("/generate_with_json_object")
    public ResponseEntity<String> generateWithJsonObject(@RequestBody InputObject inputObject) {
        try {
            byte[] pdfBytes = birtReportService.generateWithJsonObject(
                    inputObject.getFolderPath(),
                    inputObject.getReportName(),
                    inputObject.getContextName(),
                    inputObject.getParameters(),
                    inputObject.getPayload(),
                    inputObject.getQrCodeValue());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "report.pdf");

            String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);
            return ResponseEntity.ok(base64Pdf);

        } catch (Exception e) {

            System.out.println("========== BIRT ERROR ==========");
            System.out.println("Exception Type : " + e.getClass().getName());
            System.out.println("Message        : " + e.getMessage());

            Throwable cause = e.getCause();

            while (cause != null) {

                System.out.println("Cause Type     : " + cause.getClass().getName());
                System.out.println("Cause Message  : " + cause.getMessage());

                cause = cause.getCause();
            }

            System.out.println("================================");

            return ResponseEntity
                    .internalServerError()
                    .body(e.getMessage());
        }

        // catch (Exception e) {
        // e.printStackTrace();
        // return ResponseEntity.internalServerError().body(e.getMessage());
        // }
    }

}