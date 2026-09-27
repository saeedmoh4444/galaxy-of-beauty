// 3.2b — bundled try-on engine (MediaPipe FaceMesh, camera + overlays).
// Kept as a string module so Metro bundles it without an asset pipeline.
export const TRYON_HTML = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<title>Try-On</title>
<style>
  :root { --brand: #c2255c; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #0d0d12; overflow: hidden; }
  #stage { position: relative; width: 100%; height: 100%; }
  video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); pointer-events: none; }
  #hint { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          color: #fff; background: rgba(13,13,18,.75); text-align: center; font-family: system-ui; padding: 24px; }
  #hint button { margin-top: 12px; background: var(--brand); color: #fff; border: 0; border-radius: 999px;
                 padding: 10px 22px; font-size: 15px; }
  #status { position: absolute; top: 10px; inset-inline-start: 10px; color: #fff; background: rgba(0,0,0,.5);
            border-radius: 999px; padding: 4px 10px; font: 11px system-ui; display: none; }
</style>
</head>
<body>
<div id="stage">
  <video id="video" playsinline muted autoplay></video>
  <canvas id="overlay"></canvas>
  <div id="hint"><div><p id="hintText">Loading camera…</p><button id="startBtn" style="display:none">Start camera</button></div></div>
  <div id="status">Face tracking on</div>
</div>

<script>
(function () {
  'use strict';
  // ── Engine state (driven by the host app) ──────────────────────────
  var state = { type: 'lips', color: '#D4737C', intensity: 0.7, running: false };
  var landmarker = null;
  var landmarks = null;
  var raf = 0;

  var video = document.getElementById('video');
  var overlay = document.getElementById('overlay');
  var hint = document.getElementById('hint');
  var hintText = document.getElementById('hintText');
  var status = document.getElementById('status');
  var startBtn = document.getElementById('startBtn');

  // FaceMesh landmark contours (MediaPipe canonical order).
  var LIP_OUTER = [61,146,91,181,84,17,314,405,321,375,291,409,270,269,267,0,37,39,40,185];
  var LIP_INNER = [78,95,88,178,87,14,317,402,318,324,308,415,310,311,312,13,82,81,80,191];
  var LEFT_EYE = [33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7];
  var RIGHT_EYE = [263,466,388,387,386,385,384,398,362,382,381,380,374,373,390,249];

  function points(lm, idx) {
    return idx.map(function (i) { return lm[i]; }).filter(Boolean);
  }
  function fillPath(ctx, pts, w, h) {
    if (!pts || pts.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x * w, pts[0].y * h);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x * w, pts[i].y * h);
    ctx.closePath();
    ctx.fill();
  }

  function draw() {
    var ctx = overlay.getContext('2d');
    var w = overlay.width = overlay.clientWidth;
    var h = overlay.height = overlay.clientHeight;
    ctx.clearRect(0, 0, w, h);
    if (!landmarks || state.intensity <= 0) return;
    var alpha = state.intensity;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = state.color;
    if (state.type === 'lips') {
      fillPath(ctx, points(landmarks, LIP_OUTER), w, h);
      ctx.globalAlpha = alpha * 0.55;
      fillPath(ctx, points(landmarks, LIP_INNER), w, h);
    } else if (state.type === 'eyes') {
      ctx.globalAlpha = alpha * 0.55;
      fillPath(ctx, points(landmarks, LEFT_EYE), w, h);
      fillPath(ctx, points(landmarks, RIGHT_EYE), w, h);
    } else if (state.type === 'blush') {
      var cs = [landmarks[123], landmarks[352]];
      var r = Math.min(w, h) * 0.06;
      for (var k = 0; k < cs.length; k++) {
        var c = cs[k];
        if (!c) continue;
        var g = ctx.createRadialGradient(c.x * w, c.y * h, 0, c.x * w, c.y * h, r);
        g.addColorStop(0, state.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x * w, c.y * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    if (landmarker && video.readyState >= 2) {
      try {
        var res = landmarker.detectForVideo(video, now);
        landmarks = res.faceLandmarks && res.faceLandmarks[0] ? res.faceLandmarks[0] : null;
        if (landmarks) status.style.display = 'block';
      } catch (e) { /* frame race — retry next tick */ }
    }
    draw();
    raf = requestAnimationFrame(loop);
  }

  function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 960 } }, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
        return video.play();
      })
      .then(function () {
        hint.style.display = 'none';
        state.running = true;
        loadLandmarker().then(function (lm) {
          landmarker = lm;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(loop);
        });
      })
      .catch(function () {
        hintText.textContent = 'Camera unavailable — check permissions';
        startBtn.style.display = 'block';
      });
  }

  function loadLandmarker() {
    if (window._lmPromise) return window._lmPromise;
    window._lmPromise = (function () {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/vision_bundle.mjs';
      document.head.appendChild(script);
      return new Promise(function (resolve, reject) {
        var tries = 0;
        var t = setInterval(function () {
          tries++;
          if (window.FilesetResolver && window.FaceLandmarker) {
            clearInterval(t);
            var fsr = window.FilesetResolver;
            fsr.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm')
              .then(function (vision) {
                window.FaceLandmarker.createFromOptions(vision, {
                  baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task', delegate: 'GPU' },
                  runningMode: 'VIDEO', numFaces: 1,
                }).then(resolve, reject);
              }, reject);
          } else if (tries > 100) { clearInterval(t); reject(new Error('load timeout')); }
        }, 100);
      });
    })();
    return window._lmPromise;
  }

  startBtn.addEventListener('click', startCamera);

  // ── Host app messaging ─────────────────────────────────────────────
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d) return;
    if (d.cmd === 'update') {
      if (d.type) state.type = d.type;
      if (d.color) state.color = d.color;
      if (typeof d.intensity === 'number') state.intensity = d.intensity;
      draw();
    } else if (d.cmd === 'capture') {
      var snap = document.createElement('canvas');
      snap.width = video.videoWidth || overlay.width;
      snap.height = video.videoHeight || overlay.height;
      var ctx = snap.getContext('2d');
      ctx.save();
      ctx.translate(snap.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, snap.width, snap.height);
      ctx.restore();
      // re-draw overlay mirrored on the snapshot
      ctx.save();
      ctx.translate(snap.width, 0);
      ctx.scale(-1, 1);
      var prev = landmarks; landmarks = landmarks; drawSnapshot(ctx, snap.width, snap.height);
      ctx.restore();
      landmarks = prev;
      window.parent.postMessage({ cmd: 'captured', dataUrl: snap.toDataURL('image/jpeg', 0.85) }, '*');
    }
  });

  function drawSnapshot(ctx, w, h) {
    if (!landmarks || state.intensity <= 0) return;
    var alpha = state.intensity;
    ctx.globalAlpha = alpha; ctx.fillStyle = state.color;
    if (state.type === 'lips') {
      fillPath(ctx, points(landmarks, LIP_OUTER), w, h);
      ctx.globalAlpha = alpha * 0.55;
      fillPath(ctx, points(landmarks, LIP_INNER), w, h);
    } else if (state.type === 'eyes') {
      ctx.globalAlpha = alpha * 0.55;
      fillPath(ctx, points(landmarks, LEFT_EYE), w, h);
      fillPath(ctx, points(landmarks, RIGHT_EYE), w, h);
    }
    ctx.globalAlpha = 1;
  }

  startCamera();
})();
</script>
</body>
</html>
`;
