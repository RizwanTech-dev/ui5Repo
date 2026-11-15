package customer.ui5app.qrCodes;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.google.zxing.client.j2se.MatrixToImageWriter;

@Service
public class QRCodeService {
    @Value("${java.qrcodes.path}")
    private String qrPath;

    public byte[] createQRCodeBytes(String data) throws WriterException, IOException {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);

        int width = 100;
        int height = 100;

        BitMatrix bitMatrix = new MultiFormatWriter()
                .encode(data, BarcodeFormat.QR_CODE, width, height, hints);

        // Convert BitMatrix to byte[]
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "png", baos);

        return baos.toByteArray();
    }

}
