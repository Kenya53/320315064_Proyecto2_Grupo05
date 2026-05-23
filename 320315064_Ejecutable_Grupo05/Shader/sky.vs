#version 330 core
layout (location = 0) in vec2 position;
out vec2 fragPos;

void main()
{
    fragPos = position;
    gl_Position = vec4(position, 0.999, 1.0);
}