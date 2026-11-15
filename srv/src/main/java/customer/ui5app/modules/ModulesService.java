package customer.ui5app.modules;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ModulesService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Modules> getModulesFromProcedure() {
        String sql = "CALL GET_MODULES()"; // HANA procedure

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Modules m = new Modules();
            m.setId(rs.getLong("id"));
            m.setHeader(rs.getString("header"));
            m.setSubheader(rs.getString("subheader"));
            m.setContentType(rs.getString("contentType"));
            m.setContent(rs.getString("content"));
            m.setFooter(rs.getString("footer"));
            m.setRoute(rs.getString("route"));
            m.setStatus(rs.getInt("status"));
            return m;
        });
    }
}