package customer.ui5app.BirtReportGenerator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Id;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Images {
    @Id
    private Long id;
    private String imageName;
    private String imageTitle;
    private String base64String;

    public Images() {
    }

    public Images(Long id, String imageName, String imageTitle, String base64String) {
        this.id = id;
        this.imageName = imageName;
        this.imageTitle = imageTitle;
        this.base64String = base64String;
    }
}
