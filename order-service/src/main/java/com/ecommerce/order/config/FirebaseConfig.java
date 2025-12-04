package com.ecommerce.order.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.InputStream;

/**
 * Firebase configuration for server-side authentication.
 * Initializes Firebase Admin SDK for token verification using service account
 * JSON file.
 */
@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);
    private static final String SERVICE_ACCOUNT_FILE = "e-commerce-platform-c1d3c-firebase-adminsdk-fbsvc-5f5ea11557.json";

    @PostConstruct
    public void initialize() {
        try {
            // Check if FirebaseApp is already initialized
            if (!FirebaseApp.getApps().isEmpty()) {
                log.info("Firebase App already initialized");
                return;
            }

            // Try to load service account file from classpath (resources folder)
            InputStream serviceAccount = null;
            try {
                // First try classpath
                ClassPathResource resource = new ClassPathResource(SERVICE_ACCOUNT_FILE);
                if (resource.exists()) {
                    serviceAccount = resource.getInputStream();
                    log.info("Loading Firebase service account from classpath: {}", SERVICE_ACCOUNT_FILE);
                }
            } catch (Exception e) {
                log.debug("Service account file not found in classpath, trying file system");
            }

            // If not in classpath, try file system (for development)
            if (serviceAccount == null) {
                try {
                    serviceAccount = new FileInputStream(SERVICE_ACCOUNT_FILE);
                    log.info("Loading Firebase service account from file system: {}", SERVICE_ACCOUNT_FILE);
                } catch (Exception e) {
                    log.warn("Firebase service account file not found: {}. Token verification will be skipped.",
                            SERVICE_ACCOUNT_FILE);
                    log.warn(
                            "Place the service account JSON file in src/main/resources/ or in the application root directory.");
                    return;
                }
            }

            // Initialize Firebase with service account
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialized successfully");

            // Close the stream
            serviceAccount.close();

        } catch (Exception e) {
            log.error("Failed to initialize Firebase Admin SDK: {}", e.getMessage(), e);
            log.warn(
                    "Application will continue without Firebase authentication. X-User-UID header will be accepted without verification.");
        }
    }

    /**
     * Provides FirebaseAuth bean for token verification.
     * Returns null if Firebase is not configured.
     */
    @Bean
    public FirebaseAuth firebaseAuth() {
        if (FirebaseApp.getApps().isEmpty()) {
            log.warn("FirebaseAuth bean is null - Firebase not initialized");
            return null;
        }
        return FirebaseAuth.getInstance();
    }
}
