package customer.ui5app.modules;

import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Modules {
    @Id
    private Long id;

    private String header;
    private String subheader;
    private String contentType;
    private String content;
    private String footer;
    private String route;
    private Integer status;
}
