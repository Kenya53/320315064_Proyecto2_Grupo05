#version 330 core
in vec2 fragPos;
out vec4 color;

// Posicion del sol en NDC calculada cada frame en main.cpp
uniform vec2 sunPos;
// Color del sol (blanco calido diurno)
uniform vec3 sunColor;

void main()
{
    // t: 0 en horizonte, 1 en cenit
    float t = clamp((fragPos.y + 1.0) / 2.0, 0.0, 1.0);

    // Degradado azul diurno: horizonte celeste claro -> cenit azul profundo
    vec3 horizon = vec3(0.76, 0.90, 1.00);
    vec3 zenith  = vec3(0.10, 0.42, 0.82);
    vec3 skyColor = mix(horizon, zenith, pow(t, 0.8));

    // Sol: disco brillante + halo + resplandor suave
    float dist    = length(fragPos - sunPos);
    float sunCore = smoothstep(0.045, 0.018, dist);
    float sunHalo = smoothstep(0.16,  0.045, dist) * 0.45;
    float sunGlow = smoothstep(0.32,  0.16,  dist) * 0.15;

    vec3 haloColor = vec3(1.0, 0.85, 0.50);

    vec3 finalColor = skyColor
        + sunColor  * sunCore
        + haloColor * sunHalo
        + haloColor * sunGlow;

    color = vec4(finalColor, 1.0);
}