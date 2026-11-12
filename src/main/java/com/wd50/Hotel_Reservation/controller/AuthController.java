package com.wd50.Hotel_Reservation.controller;

import com.wd50.Hotel_Reservation.dto.AuthRequest;
import com.wd50.Hotel_Reservation.dto.RegisterRequest;
import com.wd50.Hotel_Reservation.dto.UpdateProfileRequest;
import com.wd50.Hotel_Reservation.model.User;
import com.wd50.Hotel_Reservation.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController extends BaseController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    private void setCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        cookie.setHttpOnly(false);
        response.addCookie(cookie);
    }

    private void attachAuthCookies(HttpServletResponse response, User user) {
        int twoWeeks = 14 * 24 * 60 * 60;
        setCookie(response, "serene_session", String.valueOf(user.getId()), twoWeeks);
        setCookie(response, "serene_role", user.getRole() != null ? user.getRole() : "guest", twoWeeks);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        try {
            User user = userService.authenticate(request.getEmail(), request.getPassword());
            attachAuthCookies(response, user);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request, HttpServletResponse response) {
        User user = userService.register(request);
        attachAuthCookies(response, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        setCookie(response, "serene_session", "", 0);
        setCookie(response, "serene_role", "", 0);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String email
    ) {
        if (id != null) {
            return userService.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        }
        if (email != null) {
            return userService.findByEmail(email).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        }
        throw new IllegalArgumentException("id or email parameter required");
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable String id, @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(parseId(id), request));
    }

    @PostMapping("/profile/{id}/avatar")
    public ResponseEntity<User> uploadAvatar(@PathVariable String id, @RequestBody Map<String, String> body) {
        String image = body != null ? body.getOrDefault("image", body.get("base64DataUrl")) : null;
        return ResponseEntity.ok(userService.uploadAndSaveAvatar(parseId(id), image));
    }

    @DeleteMapping("/profile/{id}/avatar")
    public ResponseEntity<User> removeAvatar(@PathVariable String id) {
        return ResponseEntity.ok(userService.removeAvatar(parseId(id)));
    }

    @PostMapping("/profile/{id}/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        userService.changePassword(
                parseId(id),
                body != null ? body.get("currentPassword") : null,
                body != null ? body.get("newPassword") : null
        );
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }

    @PostMapping("/profile/{id}/save-room/{roomId}")
    public ResponseEntity<User> toggleSavedRoom(@PathVariable String id, @PathVariable String roomId) {
        return ResponseEntity.ok(userService.toggleSavedRoom(parseId(id), roomId));
    }
}
