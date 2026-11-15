package customer.ui5app.container.birt;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import customer.ui5app.BirtReportGenerator.InputObject;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("birt")
public class BirtController {

    private final BirtService birtService;
    private final BirtReportsFinder birtReportsFinder;

    public BirtController(
            BirtService birtService,
            BirtReportsFinder birtReportsFinder) {

        this.birtService = birtService;
        this.birtReportsFinder = birtReportsFinder;
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveBirtData(@RequestBody InputObject inputObject) throws Exception {
        try {

            return new ResponseEntity<>(birtService.saveBirtData(inputObject), HttpStatus.OK);

        } catch (Exception e) {
            throw e;
        }
    }

    @GetMapping("/get_data")
    public ResponseEntity<?> getBirtData() {
        try {
            return ResponseEntity.ok(birtService.getBirtData());
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/get_available_reports")
    public ResponseEntity<List<BirtReportsFinder.ReportInfo>> getAvailableBirtReports(
            @RequestBody(required = false) BirtDataMapping data) throws IOException {

        String folderPath = data != null
                ? data.getFolderPath()
                : null;

        return ResponseEntity.ok(
                birtReportsFinder.getReports(folderPath));
    }

}
