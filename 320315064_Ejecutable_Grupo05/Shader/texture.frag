#version 330 core
in vec2 TexCoords;
in vec3 FragPos;
in vec3 Normal;
in vec4 FragPosLightSpace;
out vec4 color;
uniform sampler2D texture_diffuse1;
uniform sampler2D shadowMap;
uniform vec3  lightPos;
uniform vec3  lightColor;
uniform vec3  viewPos;
uniform float ambientFactor;
uniform float leafAlpha;
uniform int   isLeaf;
uniform int   isShield;
uniform float shieldTime;
uniform int   isWater;
uniform float waterTime;

float ShadowCalculation(vec4 fragPosLightSpace, vec3 norm, vec3 lightDir)
{
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;
    if (projCoords.z > 1.0) return 0.0;
    float closestDepth = texture(shadowMap, projCoords.xy).r;
    float currentDepth = projCoords.z;
    float bias = max(0.005 * (1.0 - dot(norm, lightDir)), 0.001);
    float shadow = 0.0;
    vec2 texelSize = 1.0 / textureSize(shadowMap, 0);
    for (int x = -1; x <= 1; x++)
        for (int y = -1; y <= 1; y++)
        {
            float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x,y) * texelSize).r;
            shadow += (currentDepth - bias > pcfDepth) ? 1.0 : 0.0;
        }
    return shadow / 9.0;
}

void main()
{
    if (isWater == 1)
    {
        vec2 uv = TexCoords;
        uv.x += sin(uv.y * 8.0 + waterTime * 1.4) * 0.025;
        uv.y += cos(uv.x * 6.0 + waterTime * 1.1) * 0.020;
        vec4 texColor = texture(texture_diffuse1, uv);
        vec3 waterTint = vec3(0.10, 0.45, 0.80);
        vec3 foamColor = vec3(0.70, 0.88, 1.00);
        float foam = smoothstep(0.55, 0.75, texColor.r);
        vec3 norm     = normalize(Normal);
        vec3 lightDir = normalize(lightPos - FragPos);
        float diff    = max(dot(norm, lightDir), 0.0);
        vec3  viewDir  = normalize(viewPos - FragPos);
        vec3  halfDir  = normalize(lightDir + viewDir);
        float spec     = pow(max(dot(norm, halfDir), 0.0), 64.0);
        vec3  specular = 0.6 * spec * lightColor;
        float shadow  = ShadowCalculation(FragPosLightSpace, norm, lightDir);
        vec3  ambient = ambientFactor * lightColor;
        vec3  diffuse = diff * lightColor;
        vec3 baseColor = mix(waterTint, foamColor, foam) * texColor.rgb;
        vec3 result = (ambient + (1.0 - shadow) * (diffuse + specular)) * baseColor;
        float alpha = mix(0.72, 0.92, foam);
        color = vec4(result, alpha);
        return;
    }

    vec4 texColor = texture(texture_diffuse1, TexCoords);
    if (texColor.a < 0.1) discard;
    vec3 norm     = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);
    vec3  ambient  = ambientFactor * lightColor;
    float diff     = max(dot(norm, lightDir), 0.0);
    vec3  diffuse  = diff * lightColor;
    float specStrength = 0.15;
    vec3  viewDir    = normalize(viewPos - FragPos);
    vec3  reflectDir = reflect(-lightDir, norm);
    float spec       = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
    vec3  specular   = specStrength * spec * lightColor;
    float shadow  = ShadowCalculation(FragPosLightSpace, norm, lightDir);
    vec3  result  = (ambient + (1.0 - shadow) * (diffuse + specular)) * texColor.rgb;
    float finalAlpha = texColor.a;
    if (isLeaf == 1)
        finalAlpha = mix(texColor.a, 0.25, leafAlpha);
    if (finalAlpha < 0.05) discard;
    if (isShield == 1)
    {
        float pulse = 0.5 + 0.5 * sin(shieldTime * 6.0);
        float rim   = 1.0 - max(dot(norm, normalize(viewPos - FragPos)), 0.0);
        rim         = pow(rim, 2.2);
        vec3 shieldColor = mix(vec3(1.0, 0.85, 0.0), vec3(1.0, 1.0, 0.5), pulse);
        result = mix(result, result + shieldColor * (rim * 0.9 + pulse * 0.25), 0.75);
        finalAlpha = 1.0;
    }
    color = vec4(result, finalAlpha);
}
