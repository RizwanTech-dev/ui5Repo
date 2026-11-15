package customer.ui5app.container.birt;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

@Service
public class BirtReportsFinder {

    private static final String DEFAULT_REPORT_PATH = "classpath*:reports/*.rptdesign";

    public List<ReportInfo> getReports(String folderPath) throws IOException {

        if (folderPath != null && !folderPath.trim().isEmpty()) {

            Path folder = Paths.get(folderPath);

            if (Files.exists(folder) && Files.isDirectory(folder)) {
                return getReportsFromFolder(folder);
            }
        }

        return getDefaultReports();
    }

    private List<ReportInfo> getReportsFromFolder(Path folder) throws IOException {

        List<ReportInfo> reports = new ArrayList<>();

        try (var files = Files.list(folder)) {

            files.filter(Files::isRegularFile)
                    .filter(file -> file.getFileName()
                            .toString()
                            .toLowerCase()
                            .endsWith(".rptdesign"))
                    .forEach(file -> {

                        String fileName = file.getFileName().toString();

                        String reportName = fileName.substring(
                                0,
                                fileName.toLowerCase().lastIndexOf(".rptdesign")
                        );

                        reports.add(new ReportInfo(
                                reportName,
                                file.toString()
                        ));
                    });
        }

        return reports;
    }

    private List<ReportInfo> getDefaultReports() throws IOException {

        List<ReportInfo> reports = new ArrayList<>();

        PathMatchingResourcePatternResolver resolver =
                new PathMatchingResourcePatternResolver();

        Resource[] resources =
                resolver.getResources(DEFAULT_REPORT_PATH);

        for (Resource resource : resources) {

            String fileName = resource.getFilename();

            if (fileName == null) {
                continue;
            }

            String reportName = fileName.substring(
                    0,
                    fileName.toLowerCase().lastIndexOf(".rptdesign")
            );

            reports.add(new ReportInfo(
                    reportName,
                    "reports/" + fileName
            ));
        }

        return reports;
    }

    public static class ReportInfo {

        private String reportName;
        private String path;

        public ReportInfo(String reportName, String path) {
            this.reportName = reportName;
            this.path = path;
        }

        public String getReportName() {
            return reportName;
        }

        public String getPath() {
            return path;
        }
    }
}