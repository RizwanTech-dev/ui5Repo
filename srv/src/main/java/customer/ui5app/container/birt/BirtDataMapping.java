package customer.ui5app.container.birt;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityResult;
import jakarta.persistence.FieldResult;
import jakarta.persistence.Id;
import jakarta.persistence.SqlResultSetMapping;
import lombok.Data;

@Data
@Entity
@SqlResultSetMapping(name = "birt_data_Mapping", entities = {
                @EntityResult(entityClass = BirtDataMapping.class, fields = {
                                @FieldResult(name = "id", column = "id"),
                                @FieldResult(name = "folderPath", column = "folderPath"),
                                @FieldResult(name = "reportName", column = "reportName"),
                                @FieldResult(name = "contextName", column = "contextName"),
                                @FieldResult(name = "parameters", column = "parameters"),
                                @FieldResult(name = "payload", column = "payload"),
                                @FieldResult(name = "qrCodeValue", column = "qrCodeValue")
                })
})
public class BirtDataMapping {
        @Id
        private Long id;
        private String folderPath;
        private String reportName;
        private String contextName;
        private String parameters;
        private String payload;
        private String qrCodeValue;
}
