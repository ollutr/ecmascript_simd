// Simple performance test of SIMD.add operation.  Use SIMD.add to average up elements
// in a Float32Array. Compare to scalar implementation of same function.
// Author: Peter Jensen

(function () {

  // Kernel configuration
  var kernelConfig = {
    kernelName:       "Average",
    kernelInit:       initArray,
    kernelCleanup:    cleanup,
    kernelSimd:       simdAverage,
    kernelNonSimd:    average,
    kernelIterations: 1000
  };

  // Hook up to the harness
  benchmarks.add(new Benchmark(kernelConfig));

  // Benchmark data, initialization and kernel functions
  var a   = new Float32Array(10000);
  var ax4 = new Float32x4Array(a.buffer);

  function sanityCheck() {
     return Math.abs(average(1) - simdAverage(1)) < 0.0001;
  }

  function initArray() {
    var j = 0;
    for (var i = 0, l = a.length; i < l; ++i) {
      a[i] = 0.1;
    }
    // Check that the two kernel functions yields the same result, roughly
    // Account for the fact that the simdAverage() is computed using float32
    // precision and the average() is using double precision
    return sanityCheck();
  }

  function cleanup() {
    return sanityCheck();
  }

  function average(n) {
    for (var i = 0; i < n; ++i) {
      var sum = 0.0;
      for (var j = 0, l = a.length; j < l; ++j) {
        sum += a[j];
      }
    }
    return sum/a.length;
  }

  function simdAverage(n) {
    var ax4_length = ax4.length;
    for (var i = 0; i < n; ++i) {
      var sum4 = float32x4.zero();
      for (var j = 0; j < ax4_length; ++j) {
        sum4 = SIMD.float32x4.add(sum4, ax4.getAt(j));
      }
    }
    return (sum4.x + sum4.y + sum4.z + sum4.w)/a.length;
  }

} ());
