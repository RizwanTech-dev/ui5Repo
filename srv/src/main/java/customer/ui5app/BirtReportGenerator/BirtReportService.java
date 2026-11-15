
package customer.ui5app.BirtReportGenerator;

import org.eclipse.birt.core.exception.BirtException;
import org.eclipse.birt.core.framework.Platform;
import org.eclipse.birt.report.engine.api.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.WriterException;
import com.lowagie.text.FontFactory;

import customer.ui5app.qrCodes.QRCodeService;
import jakarta.annotation.PostConstruct;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BirtReportService {
    @Value("${birt.report.path}")
    private String reportPath;

    @Value("${birt.fonts.path}")
    private String fontsPath;

    @Value("${java.images.path}")
    private String imagesPath;

    @PersistenceContext
    private EntityManager entityManager;

    @PostConstruct
    public void registerFonts() {
        registerFontFromClasspath("fonts/EuclidSquare-Regular.ttf", "Euclid Square Regular");
        registerFontFromClasspath("fonts/EuclidSquare-Semibold.ttf", "Euclid Square Semibold");
        registerFontFromClasspath("fonts/notoNaskhArabic/NotoNaskhArabic-Bold.ttf", "Noto Naskh Arabic SemiBold");
    }

    private void registerFontFromClasspath(String classpathLocation, String fontAlias) {
        try {
            URL fontUrl = getClass().getClassLoader().getResource(classpathLocation);
            if (fontUrl != null) {
                FontFactory.register(new File(fontUrl.toURI()).getAbsolutePath(), fontAlias);
                System.out.println("Registered font: " + fontAlias);
            } else {
                System.err.println("Font not found: " + classpathLocation);
            }
        } catch (Exception e) {
            System.err.println("Failed to register font " + fontAlias + ": " + e.getMessage());
        }
    }

    public void generateSimplePdfReport() {
        try {
            EngineConfig config = new EngineConfig();
            Platform.startup(config);
            IReportEngineFactory factory = (IReportEngineFactory) Platform.createFactoryObject(
                    IReportEngineFactory.EXTENSION_REPORT_ENGINE_FACTORY);
            IReportEngine engine = factory.createReportEngine(config);

            System.out.println("Trying to load: " + reportPath + "dummy.rptdesign");
            InputStream designStream = getClass().getClassLoader()
                    .getResourceAsStream(reportPath + "dummy.rptdesign");
            if (designStream == null) {
                throw new RuntimeException(
                        "Report design file not found at: " + reportPath + "dummy.rptdesign");
            }
            IReportRunnable report = engine.openReportDesign(designStream);
            IRunAndRenderTask task = engine.createRunAndRenderTask(report);
            PDFRenderOption options = new PDFRenderOption();
            Path outputPath = Paths.get(System.getProperty("user.home"), "Downloads", "dummy.pdf");
            Files.createDirectories(outputPath.getParent());
            options.setOutputFileName(outputPath.toString());
            options.setOutputFormat(IRenderOption.OUTPUT_FORMAT_PDF);
            task.setRenderOption(options);
            task.run();
            task.close();
            engine.destroy();
            Platform.shutdown();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate BIRT report", e);
        }
    }

    public String generateBaseString()
            throws Exception {
        String fileName = "dummy"; // "test"; // "dummy";
        String fullPath = reportPath + fileName + ".rptdesign";
        // MyEntity entity = new MyEntity();

        String rptContent;
        try (InputStream resStream = getClass().getClassLoader().getResourceAsStream(fullPath)) {
            if (resStream == null) {
                throw new FileNotFoundException("Resource not found: " + fullPath);
            }
            rptContent = new String(resStream.readAllBytes(), StandardCharsets.UTF_8);
        }
        rptContent = rptContent.replaceFirst(
                "(?<=<report[^>]*version=\")\\d+(\\.\\d+)*",
                "3.2.23");
        InputStream inputStream = new ByteArrayInputStream(rptContent.getBytes(StandardCharsets.UTF_8));

        EngineConfig config = new EngineConfig();
        long startTime = System.currentTimeMillis();
        Platform.startup(config);
        long endTime = System.currentTimeMillis();
        System.out.println("BIRT Engine startup time: " + (endTime - startTime) + "ms");

        IReportEngineFactory factory = (IReportEngineFactory) Platform
                .createFactoryObject(IReportEngineFactory.EXTENSION_REPORT_ENGINE_FACTORY);
        IReportEngine engine = factory.createReportEngine(config);

        IReportRunnable design = engine.openReportDesign(inputStream);
        IRunAndRenderTask task = engine.createRunAndRenderTask(design);

        // Encoded Image checkedbox
        String base64CheckedimageFullPath = imagesPath + "checkbox.png";
        String base64Checked = encodeImageToBase64(base64CheckedimageFullPath);

        String base64UncheckedimageFullPath = imagesPath + "unChecked.png";
        String base64Unchecked = encodeImageToBase64(base64UncheckedimageFullPath);

        Map<String, Object> appContext = new HashMap<>();

        appContext.put("base64Checked", base64Checked); // Without "data:image/..."
        appContext.put("base64Unchecked", base64Unchecked); // Without "data:image/..."

        task.setAppContext(appContext);
        // Sample params for now
        Boolean is1Bed = true;

        // report parameters
        Map<String, Object> params = new HashMap<>();

        params.put("is1Bed", is1Bed);
        task.setParameterValues(params);

        // Configure PDF output
        ByteArrayOutputStream pdfStream = new ByteArrayOutputStream();
        PDFRenderOption options = new PDFRenderOption();
        options.setOutputFormat(IRenderOption.OUTPUT_FORMAT_PDF);
        options.setOutputStream(pdfStream);

        task.setRenderOption(options);
        task.run();
        task.close();
        engine.destroy();
        Platform.shutdown();

        byte[] pDfBytes = pdfStream.toByteArray();
        return Base64.getEncoder().encodeToString(pDfBytes);
    }

    // utilities
    // image encoder to base 64
    public String encodeImageToBase64(String imagePathInResources) throws IOException {
        InputStream is = getClass().getClassLoader().getResourceAsStream(imagePathInResources);
        if (is == null) {
            throw new FileNotFoundException("Image not found: " + imagePathInResources);
        }

        byte[] imageBytes = is.readAllBytes();
        return Base64.getEncoder().encodeToString(imageBytes);
    }

    // Birt Screen
    @SuppressWarnings("unchecked")
    public byte[] generateWithJsonObject(String folderPath, String reportName, String contextName,
            Map<String, Object> parameters,
            Map<String, Object> payload,
            String qrCodeValue)
            throws IOException, BirtException, IllegalAccessException, WriterException {

        InputStream inputStream;
        String rptContent;

        // Step 1: Read the .rptdesign file as text
        if (folderPath != null && !folderPath.isBlank()) {
            String fullPath = folderPath;
            if (!folderPath.endsWith(File.separator)) {
                fullPath += File.separator;
            }
            fullPath += reportName + ".rptdesign";

            try {
                rptContent = Files.readString(Paths.get(fullPath), StandardCharsets.UTF_8);
            } catch (FileNotFoundException e) {
                System.err.println("File not found: " + fullPath);
                e.printStackTrace();
                throw e;
            }
        } else {
            String fullPath = reportPath + "dummy" + ".rptdesign";
            if (reportName != null && !reportName.trim().isEmpty()) {
                fullPath = reportPath + reportName + ".rptdesign";
            }

            try (InputStream resStream = getClass().getClassLoader().getResourceAsStream(fullPath)) {
                if (resStream == null) {
                    throw new FileNotFoundException("Resource not found: " + fullPath);
                }
                rptContent = new String(resStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        }

        // Step 2: Replace version tag dynamically
        rptContent = rptContent.replaceFirst(
                "(?<=<report[^>]*version=\")\\d+(\\.\\d+)*", // Match version number after version="
                "3.2.23" // Your new version
        );

        // Step 3: Convert updated string to InputStream for BIRT
        inputStream = new ByteArrayInputStream(rptContent.getBytes(StandardCharsets.UTF_8));

        // Step 4: Continue with your existing BIRT processing
        EngineConfig config = new EngineConfig();
        Platform.startup(config);

        IReportEngineFactory factory = (IReportEngineFactory) Platform
                .createFactoryObject(IReportEngineFactory.EXTENSION_REPORT_ENGINE_FACTORY);
        IReportEngine engine = factory.createReportEngine(config);

        IReportRunnable design = engine.openReportDesign(inputStream);
        IRunAndRenderTask task = engine.createRunAndRenderTask(design);
        if (parameters != null && !parameters.isEmpty()) {
            Map<String, Object> paramMap = (Map<String, Object>) parameters;

            for (Map.Entry<String, Object> entry : paramMap.entrySet()) {
                String paramName = entry.getKey();
                Object paramValue = entry.getValue();

                System.out.println("✅ Setting BIRT parameter: " + paramName + " = " + paramValue);
                task.setParameterValue(paramName, paramValue);
            }
        }

        setDynamicParameters(payload, task);
        String context = "inputObject";
        if (contextName == null || contextName.isBlank()) {
            contextName = context;
        }

        // QR Codes

        if (qrCodeValue != null && !qrCodeValue.isEmpty()) {
            QRCodeService createQRCodeBytes = new QRCodeService();
            byte[] qrBytes = createQRCodeBytes.createQRCodeBytes(qrCodeValue);

            if (qrBytes != null) {
                String base64Pdf = Base64.getEncoder().encodeToString(qrBytes);
                task.setParameterValue("qrCodeString", base64Pdf);
            }

        }
        // Images
        Object imagesObj = payload.get("images"); // raw list from JSON
        ObjectMapper mapper = new ObjectMapper();
        List<Images> images = mapper.convertValue(
                imagesObj,
                new TypeReference<List<Images>>() {
                });

        payload.put("images", images);

        // Images putting them into parameters aswell
        if (images != null)
            for (Images image : images) {
                task.setParameterValue(image.getImageName(), image.getBase64String());
            }

        // ✅ Pass your JSON payload into BIRT app context
        task.getAppContext().put(contextName, payload);

        ByteArrayOutputStream pdfStream = new ByteArrayOutputStream();
        PDFRenderOption options = new PDFRenderOption();
        options.setOutputFormat(IRenderOption.OUTPUT_FORMAT_PDF);
        options.setOutputStream(pdfStream);
        task.setRenderOption(options);

        task.run();
        task.close();
        engine.destroy();
        Platform.shutdown();

        return pdfStream.toByteArray();
    }

    // Method to dynamically set parameters
    // Generic method to dynamically set BIRT parameters
    @SuppressWarnings("unchecked")
    private void setDynamicParameters(Object input, IRunAndRenderTask task) throws IllegalAccessException {
        try {
            if (input == null) {
                return;
            }

            // ✅ Case 1: If it's a Map (like JSON payload) // we are mapping the fields as
            // the parameters
            if (input instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) input;
                for (Map.Entry<String, Object> entry : map.entrySet()) {
                    String key = entry.getKey();
                    Object value = entry.getValue();
                    task.setParameterValue(key, value);
                }
            }

            // ✅ Case 2: If it's a POJO (entity) //Not using as of here because no entity
            else {
                Field[] fields = input.getClass().getDeclaredFields();
                for (Field field : fields) {
                    field.setAccessible(true);
                    String fieldName = field.getName();
                    Object fieldValue = field.get(input);
                    task.setParameterValue(fieldName, fieldValue);
                }
            }

        } catch (IllegalAccessException e) {
            e.printStackTrace();
            throw e;
        }
    }

}