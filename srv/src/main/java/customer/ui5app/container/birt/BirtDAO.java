package customer.ui5app.container.birt;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Repository
public class BirtDAO {

    private static final Logger logger = LoggerFactory.getLogger(BirtDAO.class);

    @PersistenceContext
    private EntityManager entityManager;

    public String saveBirtData(BirtDataMapping birtDataMapping) throws Exception {
        try {
            StoredProcedureQuery sq_addEditBirtData = entityManager.createStoredProcedureQuery("ADD_EDIT_BIRT_DATA");
            sq_addEditBirtData.registerStoredProcedureParameter("IN_PARAM", String.class, ParameterMode.IN);
            sq_addEditBirtData.registerStoredProcedureParameter("EX_MESSAGE", String.class, ParameterMode.OUT);

            // Convert UsersRequest -> JSON String
            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(birtDataMapping);

            sq_addEditBirtData.setParameter("IN_PARAM", json);

            sq_addEditBirtData.execute();

            String result = (String) sq_addEditBirtData.getOutputParameterValue("EX_MESSAGE");
            return result;

        } catch (Exception e) {
            throw e;
        }
    }

    public List<BirtDataMapping> getBirtData() {
        try {
            StoredProcedureQuery sQuery = entityManager.createStoredProcedureQuery("GET_BIRT_DATA",
                    "birt_data_Mapping");
            sQuery.execute();

            @SuppressWarnings("unchecked")
            List<BirtDataMapping> birtDataMapping = sQuery.getResultList();
            return birtDataMapping;

        } catch (Exception e) {
            logger.error("Error retrieving Birt data", e);
        }
        return null;
    }

}
