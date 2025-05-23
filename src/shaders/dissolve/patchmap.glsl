#include <colorspace_fragment>

if(diff < edgeThreshold || diff > edgeWidth - edgeThreshold && diff < edgeWidth) {
gl_FragColor = vec4(uEdgeColor, 1.0);
} else if(diff < edgeWidth) {
gl_FragColor = vec4(uMiddleColor * 2.0, 1.0);
}