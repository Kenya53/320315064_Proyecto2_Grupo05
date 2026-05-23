#version 330 core

out vec4 FragColor;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

// textura
uniform sampler2D texture_diffuse1;

// luz
uniform vec3 lightPos;
uniform vec3 lightColor;

// cámara
uniform vec3 viewPos;

void main()
{
    vec3 texColor = texture(texture_diffuse1, TexCoords).rgb;

    // ===== AMBIENT =====
    float ambientStrength = 0.7;
    vec3 ambient = ambientStrength * lightColor;

    // ===== DIFFUSE =====
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);

    float diff = max(dot(norm, lightDir), 0.0);

    //efecto retro (tipo NES)
    diff = floor(diff * 4.0) / 4.0;

    vec3 diffuse = diff * lightColor;

    // ===== SPECULAR =====
    float specularStrength = 0.2;

    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);

    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 8);
    vec3 specular = specularStrength * spec * lightColor;

    // ===== RESULTADO FINAL =====
    vec3 result = (ambient + diffuse + specular) * texColor;

    FragColor = vec4(result, 1.0);
}