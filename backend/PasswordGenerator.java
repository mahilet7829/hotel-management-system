import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "Admin123";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Raw: " + rawPassword);
        System.out.println("Encoded: " + encodedPassword);
        
        // Verify it works
        System.out.println("Match: " + encoder.matches(rawPassword, encodedPassword));
    }
}
