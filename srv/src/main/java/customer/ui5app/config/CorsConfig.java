package customer.ui5app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class CorsConfig implements WebMvcConfigurer{

     @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")                              // .allowedOrigins(allowedOrigins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    //  private final List<String> allowedOrigins = List.of(
    //         "http://localhost:5501", // dev
    //         "http://127.0.0.1:5501", // alternate dev
    //         "https://yourdomain.com", // production
    //         "http://localhost:8081",
    //         "http://localhost:8080"
    // );
}
