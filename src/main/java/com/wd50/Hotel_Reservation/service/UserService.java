package com.wd50.Hotel_Reservation.service;

import com.wd50.Hotel_Reservation.dto.RegisterRequest;
import com.wd50.Hotel_Reservation.dto.UpdateProfileRequest;
import com.wd50.Hotel_Reservation.model.User;
import com.wd50.Hotel_Reservation.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class UserService extends BaseService<User> {

    private final UserRepository userRepository;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();

    @Value("${imgbb.api.key:5e3a92d512d29cc4aae18b67ca78d6f1}")
    private String imgbbApiKey;

    public UserService(UserRepository userRepository) {
        super(userRepository);
        this.userRepository = userRepository;
    }

    public static String hashPassword(String plainPassword) {
        if (plainPassword == null) return null;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(plainPassword.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder("sha256:");
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return plainPassword;
        }
    }

    public static boolean verifyPassword(String input, String stored) {
        if (input == null || stored == null) return false;
        return stored.equals(input) || stored.equals(hashPassword(input));
    }

    public User authenticate(String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Email and password are required.");
        }
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if ("suspended".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("Your account has been deactivated.");
        }
        if (!verifyPassword(password.trim(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect password.");
        }
        if (!user.getPassword().startsWith("sha256:")) {
            user.setPassword(hashPassword(password.trim()));
            save(user);
        }
        return user;
    }

    public User register(RegisterRequest req) {
        if (req.getPassword() == null || req.getPassword().trim().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }
        if (req.getPhone() == null || req.getPhone().replaceAll("\\D", "").length() < 9) {
            throw new IllegalArgumentException("Please enter a valid phone number.");
        }
        String cleanEmail = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = new User(
                req.getFullName() != null ? req.getFullName().trim() : "",
                cleanEmail,
                hashPassword(req.getPassword().trim()),
                req.getPhone().trim(),
                req.getCity() != null ? req.getCity().trim() : "",
                req.getCountry() != null ? req.getCountry().trim() : "Sri Lanka",
                ""
        );
        return save(user);
    }

    public User updateProfile(Long userId, UpdateProfileRequest req) {
        User user = getById(userId);
        if (req.getFullName() != null) user.setFullName(req.getFullName().trim());
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            String cleanEmail = req.getEmail().trim().toLowerCase();
            if (!cleanEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(cleanEmail)) {
                throw new IllegalArgumentException("Email is already in use.");
            }
            user.setEmail(cleanEmail);
        }
        if (req.getPhone() != null) user.setPhone(req.getPhone().trim());
        if (req.getCity() != null) user.setCity(req.getCity().trim());
        if (req.getCountry() != null) user.setCountry(req.getCountry().trim());
        if (req.getPreferredCurrency() != null) user.setPreferredCurrency(req.getPreferredCurrency());
        if (req.getAvatar() != null) {
            String val = req.getAvatar().trim();
            if (val.isEmpty() || "REMOVE".equalsIgnoreCase(val)) {
                user.setAvatarUrl("");
            } else if (val.startsWith("data:image/")) {
                user.setAvatarUrl(uploadImageToImgbb(val));
            } else {
                user.setAvatarUrl(val);
            }
        }
        return save(user);
    }

    public User changePassword(Long userId, String currentPassword, String newPassword) {
        User user = getById(userId);
        if (!verifyPassword(currentPassword != null ? currentPassword.trim() : "", user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }
        user.setPassword(hashPassword(newPassword.trim()));
        return save(user);
    }

    public User uploadAndSaveAvatar(Long userId, String base64Image) {
        if (base64Image == null || base64Image.isBlank()) {
            throw new IllegalArgumentException("Image data is required.");
        }
        User user = getById(userId);
        user.setAvatarUrl(uploadImageToImgbb(base64Image));
        return save(user);
    }

    public User removeAvatar(Long userId) {
        User user = getById(userId);
        user.setAvatarUrl("");
        return save(user);
    }

    public User toggleSavedRoom(Long userId, String roomId) {
        User user = getById(userId);
        user.toggleSavedRoom(roomId);
        return save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAdmins() {
        List<User> admins = new ArrayList<>();
        for (User user : getAll()) {
            if (user.hasAdminRole()) {
                admins.add(user);
            }
        }
        return admins;
    }

    public User createAdmin(Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "").trim();
        if (password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("A user with this email already exists.");
        }
        User admin = new User(
                body.getOrDefault("fullName", "").trim(),
                email,
                hashPassword(password),
                body.getOrDefault("phone", "").trim(),
                "Bentota",
                "Sri Lanka",
                ""
        );
        admin.setRole(body.getOrDefault("role", "admin").trim().toLowerCase());
        return save(admin);
    }

    public User updateAdmin(Long id, Map<String, String> body) {
        User user = getById(id);
        if (body.get("fullName") != null) user.setFullName(body.get("fullName").trim());
        if (body.get("email") != null && !body.get("email").isBlank()) {
            String email = body.get("email").trim().toLowerCase();
            if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email already exists.");
            }
            user.setEmail(email);
        }
        if (body.get("role") != null) user.setRole(body.get("role").toLowerCase());
        if (body.get("phone") != null) user.setPhone(body.get("phone").trim());
        if (body.get("status") != null) user.setStatus(body.get("status"));
        if (body.get("password") != null && !body.get("password").isBlank()) {
            user.setPassword(hashPassword(body.get("password").trim()));
        }
        return save(user);
    }

    public void deleteAdmin(Long id) {
        User user = getById(id);
        if ("super_admin".equalsIgnoreCase(user.getRole()) || "admin@serenestay.com".equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("The primary Super Administrator cannot be deleted.");
        }
        delete(id);
    }

    public String uploadImageToImgbb(String imageInput) {
        try {
            String base64 = imageInput.contains(",") ? imageInput.substring(imageInput.indexOf(",") + 1) : imageInput;
            String form = "image=" + URLEncoder.encode(base64.replaceAll("\\s+", ""), StandardCharsets.UTF_8);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.imgbb.com/1/upload?key=" + imgbbApiKey))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            Matcher m = Pattern.compile("\"display_url\"\\s*:\\s*\"([^\"]+)\"").matcher(response.body());
            if (m.find()) {
                return m.group(1).replace("\\/", "/");
            }
            throw new IllegalArgumentException("Image upload failed.");
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to upload image: " + e.getMessage());
        }
    }
}
