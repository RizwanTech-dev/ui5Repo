package customer.ui5app.modules;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class ModulesController {

    @Autowired
    ModulesService service;

  
    @GetMapping("/get_modules")
    public List<Modules> triggerProcedure() throws Exception {
        
      List<Modules> modules = service.getModulesFromProcedure();
      return modules;
    }

}
