uniform float uSliceStart;
uniform float uSliceArc;
uniform float uTime;
uniform sampler2D uPerlinTexture;
uniform vec3 uEdgeColor;
uniform vec3 uMiddleColor;
uniform float uAnimationSpeed;
uniform float uNoiseFrequency;

varying vec3 vPosition;
varying vec2 vUv;

#include ../includes/simplex3D.glsl

void main() {
    // Perlin
    float perlin = texture(uPerlinTexture, vUv).r;

    // Normalise position for noise
    vec3 nPosition = normalize(vPosition);
    float noise = snoise(nPosition * uNoiseFrequency); // ranges from -1 to 1

    float threshold = sin(uTime * uAnimationSpeed - PI) * 1.4;

    // Colour the edges differently
    float edgeWidth = 0.2;

    // split the edge into 3: 15%, 70%, 15%
    float diff = abs(noise - threshold);
    float edgeThreshold = 0.15 * edgeWidth;

    if(noise < threshold) {
        discard;
    }

    float csm_Dissolve;
}