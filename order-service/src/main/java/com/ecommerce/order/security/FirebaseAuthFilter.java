package com.ecommerce.order.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Firebase Authentication Filter.
 * Verifies Firebase ID tokens and extracts user information.
 * Falls back to X-User-UID header if Firebase is not configured.
 */
@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(FirebaseAuthFilter.class);

    @Autowired(required = false)
    private FirebaseAuth firebaseAuth; // May be null if Firebase not configured

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Skip authentication for public endpoints
        String path = request.getRequestURI();
        if (isPublicEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String userUid = null;

            // Try to extract bearer token first
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String idToken = authHeader.substring(7);
                if (firebaseAuth != null) {
                    userUid = verifyFirebaseToken(idToken);
                } else {
                    log.warn("FirebaseAuth bean not available; skipping token verification.");
                }
            }

            // Fall back to X-User-UID header
            if (userUid == null) {
                userUid = request.getHeader("X-User-UID");

                if (firebaseAuth != null && userUid != null) {
                    log.debug("Using X-User-UID header (Firebase SDK available but no Bearer token provided): {}",
                            userUid);
                } else if (userUid != null) {
                    log.debug("Using X-User-UID header (Firebase SDK not configured): {}", userUid);
                }
            }

            // Require authentication for protected endpoints
            if (userUid == null || userUid.isEmpty()) {
                log.warn("No authentication provided for protected endpoint: {}", path);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
                return;
            }

            // Set user UID in request attribute for controllers to use
            request.setAttribute("userUid", userUid);

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("Authentication error: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid authentication");
        }
    }

    /**
     * Verify Firebase ID token and return user UID.
     */
    private String verifyFirebaseToken(String idToken) {
        if (firebaseAuth == null) {
            log.warn("Firebase Auth is not configured. Cannot verify token.");
            return null;
        }

        try {
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            log.debug("Firebase token verified successfully for user: {}", uid);
            return uid;
        } catch (FirebaseAuthException e) {
            log.warn("Firebase token verification failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Check if the endpoint is public and doesn't require authentication.
     */
    private boolean isPublicEndpoint(String path) {
        return path.equals("/") ||
                path.startsWith("/api/orders/health") ||
                path.startsWith("/api/v1/orders/health") ||
                path.startsWith("/actuator") ||
                path.startsWith("/favicon.ico") ||
                path.startsWith("/error");
    }
}
