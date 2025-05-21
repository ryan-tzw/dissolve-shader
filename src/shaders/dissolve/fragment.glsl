uniform float uSliceStart;
uniform float uSliceArc;
uniform float uTime;
uniform sampler2D uPerlinTexture;
uniform vec3 uDissolveColor;
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
    // noise = (noise + 1.0) / 2.0; // Normalise to 0-1

    float threshold = sin(uTime * uAnimationSpeed - PI) * 1.5;
    // threshold = 0.0; // pause for testing

    // Colour the edges differently
    float edgeWidth = 0.2;

    // split the edge into 3: 10%, 80%, 10%
    float diff = abs(noise - threshold);
    float edgeThreshold = 0.1 * edgeWidth;

    if(noise < threshold) {
        discard;
    }

    float csm_Dissolve;
}