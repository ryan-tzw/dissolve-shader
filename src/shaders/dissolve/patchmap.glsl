#include <colorspace_fragment>

// gl_FragColor = vec4(vec3(1.0), 1.0);

// vec3 finalColor = vec3(1.0, 0.65, 0.0);
vec3 finalColor = uDissolveColor;
if(diff < edgeThreshold || diff > edgeWidth - edgeThreshold && diff < edgeWidth) {
gl_FragColor = vec4(finalColor, 1.0);
} else if(diff < edgeWidth) {
gl_FragColor = vec4(vec3(1.0), 1.0);
}

// gl_FragColor = vec4(vec2(vUv), 1.0, 1.0);
// gl_FragColor = vec4(vec3(perlin), 1.0);
// gl_FragColor = vec4(vec3(noise), 1.0);