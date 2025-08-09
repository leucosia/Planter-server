package com.planter.planter.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Value("${api.title}")
    private String apiTitle;

    @Value("${api.description}")
    private String description;

    @Value("${api.version}")
    private String apiVersion;

    private Info apiInfo() {
        return new Info()
                .title(apiTitle)
                .description(description)
                .version(apiVersion);
    }

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .components(new Components())
                .info(apiInfo());
    }


}
