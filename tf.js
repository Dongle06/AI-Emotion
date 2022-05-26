const video = document.getElementById('webcam');
const webcam_canvas = document.getElementById('webcam_canvas');
const cam_ctx = webcam_canvas.getContext('2d');
const width = 440
const height = 330
let model = undefined;
let model_emotion = undefined;
let control = false;
let emotion = [0, 0, 0, 0, 0, 0, 0];
let count = 0;
let label = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"];
// Error fallback when webcam access is denied.
let errorCallback = function(error) {
  if (error.name == 'NotAllowedError') {instructionText.innerHTML = "Webcam Access Not Allowed";}
	else if(error.name == 'PermissionDismissedError')  {instructionText.innerHTML = "Permission Denied. Please provide Webcam Access."; }

};

// Function to handle enableWebcamButton click.
// Takes video feed and the call predictWebcam function.
function enableCam() {
	control = true;
	const constraints = {
	  audio: false,
	  video: { width: 440, height: 330 },
	};

	// Activate the webcam stream.
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		video.srcObject = stream;

		setTimeout(function () {
			video.addEventListener('loadeddata', predictWebcam());
		}, 21000);

		cameraaccess = true;

	}).catch(errorCallback)
}

function getUserMediaSupported() {
  return (navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (getUserMediaSupported()) {
	blazeface.load().then(function (loadedModel) {
		model = loadedModel;
	});

	class L2 {
		static className = 'L2';

		constructor(config) {
			return tf.regularizers.l1l2(config)
		}
	}

	tf.serialization.registerClass(L2);

	tf.loadLayersModel('model/model2/model.json', false).then(function (loadedModel) {
		model_emotion = loadedModel;

	});

	enableCam();

} else {
	console.warn('getUserMedia() is not supported by your browser');
	instructionText.innerHTML = "getUserMedia() is not supported by your browser"
}

function predictWebcam() {
	cam_ctx.drawImage(video, 0, 0, width, height);
	const frame =cam_ctx.getImageData(0, 0, width, height);

	model.estimateFaces(frame).then(function (predictions) {
		if(predictions.length === 1) {
			landmark = predictions[0]['landmarks'];
			nosex = landmark[2][0];
			nosey = landmark[2][1];
			right = landmark[4][0];
			left = landmark[5][0];
			length = (left-right)/2 + 5;
			//이미지 크롭
			const frame2 = cam_ctx.getImageData(nosex - length, nosey-length, 2*length, 2*length);
			//Image is converted to tensor - resize, dimension 추가. [1, 48, 48, 1] 로 바꿔서 모델로 전달.
			let image_tensor = tf.browser.fromPixels(frame2).resizeBilinear([48, 48]).mean(2).toFloat().expandDims(0).expandDims(-1);

			const result = model_emotion.predict(image_tensor);
			const predictedValue = result.arraySync();

			count_result(predictedValue, emotion);

		}

		// Call this function again to keep predicting when the browser is ready.
		if( control ){
			window.requestAnimationFrame(predictWebcam);
		}

	});
}

function count_result(predicted, emotion) {
	count++;
	let max = 0
	for(let i=1; i<7; i++){
		if(predicted['0'][i] > predicted['0'][max])
			max = i
	}
	emotion[max]++
}

function get_result(emotion) {
	let result_index = emotion.reduce((imax, x, i, arr) => x > arr[imax] ? i : imax, 0);
	let result = label[result_index];
	window.parent.postMessage({message: result}, "*");
}

let count_time = setInterval(function () {
	if (count > 15) {
		get_result(emotion);
		clearInterval(count_time);
		count = 0;
	}
	}, 1000);



