package customer.ui5app.container.birt;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import customer.ui5app.BirtReportGenerator.InputObject;

@Service
public class BirtService {

    @Autowired
    BirtDAO birtDAO;

    public String saveBirtData(InputObject inputObject) throws Exception {
        try {
            BirtDataMapping birtDataMapping = new BirtDataMapping();
            birtDataMapping.setId(inputObject.getId());
            birtDataMapping.setContextName(inputObject.getContextName());
            birtDataMapping.setFolderPath(inputObject.getFolderPath());
            birtDataMapping.setReportName(inputObject.getReportName());

            ObjectMapper mapper = new ObjectMapper();
            String parametersJson = mapper.writeValueAsString(inputObject.getParameters());
            String payloadJson = mapper.writeValueAsString(inputObject.getPayload());

            birtDataMapping.setParameters(parametersJson);
            birtDataMapping.setPayload(payloadJson);
            birtDataMapping.setQrCodeValue(inputObject.getQrCodeValue());

            return birtDAO.saveBirtData(birtDataMapping);
        } catch (Exception e) {
            throw e;
        }
    }

    @SuppressWarnings("unchecked")
    public List<InputObject> getBirtData() throws Exception {
        try {

            List<BirtDataMapping> birtDataMappingList = birtDAO.getBirtData();
            List<InputObject> inputObjectList = new ArrayList<>();

            ObjectMapper mapper = new ObjectMapper();

            for (BirtDataMapping birtDataMapping : birtDataMappingList) {

                Map<String, Object> parameters = null;
                Map<String, Object> payload = null;

                if (birtDataMapping.getParameters() != null) {
                    parameters = mapper.readValue(
                            birtDataMapping.getParameters(), Map.class);
                }

                if (birtDataMapping.getPayload() != null) {
                    payload = mapper.readValue(
                            birtDataMapping.getPayload(), Map.class);
                }

                InputObject inputObject = new InputObject();
                // Long defaultId = 1l;
                // if (birtDataMapping.getId() == null) {
                // birtDataMapping.setId(defaultId);
                // }

                inputObject.setId(birtDataMapping.getId()); // if exists
                inputObject.setContextName(birtDataMapping.getContextName());
                inputObject.setFolderPath(birtDataMapping.getFolderPath());
                inputObject.setReportName(birtDataMapping.getReportName());
                inputObject.setQrCodeValue(birtDataMapping.getQrCodeValue());

                inputObject.setParameters(parameters);
                inputObject.setPayload(payload);

                inputObjectList.add(inputObject);
            }

            return inputObjectList;

        } catch (Exception e) {
            throw e;
        }
    }

}
