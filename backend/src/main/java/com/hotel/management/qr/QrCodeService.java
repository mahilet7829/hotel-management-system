package com.hotel.management.qr.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class QrCodeService {
    
    private static final String QR_CODE_DIRECTORY = System.getProperty("user.home") + "/hotel-qrcodes/";
    private static final int WIDTH = 200;
    private static final int HEIGHT = 200;
    
    public String generateRoomQrCode(String roomNumber) {
        try {
            String content = "ROOM:" + roomNumber;
            String fileName = "room_" + roomNumber + ".png";
            
            Path directoryPath = Paths.get(QR_CODE_DIRECTORY);
            if (!Files.exists(directoryPath)) {
                Files.createDirectories(directoryPath);
            }
            
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, WIDTH, HEIGHT);
            
            Path filePath = Paths.get(QR_CODE_DIRECTORY + fileName);
            MatrixToImageWriter.writeToPath(bitMatrix, "PNG", filePath);
            
            return "/qrcodes/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage(), e);
        }
    }
}