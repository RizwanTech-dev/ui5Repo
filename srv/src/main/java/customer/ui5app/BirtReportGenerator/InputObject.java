package customer.ui5app.BirtReportGenerator;

import java.util.List;
import java.util.Map;

import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InputObject {
    @Id
    private Long id;

    private String folderPath; // Folder where report resides
    private String reportName; // Report file name (without .rptdesign)
    private String contextName; // BIRT app context name
    private Map<String, Object> parameters; // BIRT parameters
    private Map<String, Object> payload; // Payload object
    private String qrCodeValue;

    List<Images> images;
}
