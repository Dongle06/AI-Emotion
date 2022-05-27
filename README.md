# AI-Emotion

1. Keras model tensorflow.js로 변환
- pip install tensorflow
- pip install tensorflowjs

convert directory로 이동 후 터미널에 다음을 입력한다.

`tensorflowjs_converter --input_format=keras /src/{model_name}.hdf5 /result/model`

result directory에 model.json 생성 확인

2. tf.js 
 - enableCam(): navigator.mediaDevices.getUserMedia(constraints)로 사용자의 웹캠을 켜준다.
 - model load: face detector인 balzeface model과 학습시킨 후 tensorflow.js로 사용하기 위해 앞서 변환시킨 emotion recognizer model.json을 load한다.
 - predictWebcam(): 이미지 크롭 및 모델의 input 형식에 맞춰 resize, dimension 추가를 해준 후, model_emotion.predict(image_tensor); 로 predict를 한다.

 ❗ issue ❗
 
>Unhandled Rejection (Error): Unknown regularizer: L2. This may be due to one of the following reasons:
>
>1. The regularizer is defined in Python, in which case it needs to be ported to TensorFlow.js or your JavaScript code.
>
>2. The custom regularizer is defied in JavaScript, but is not registered properly with tf.serialization.registerClass().

l2 regularizer를 적용한 keras 모델을 tensorflow.js로 변환 시 발생하는 에러이다. 다음과 같이 L2 class를 등록해줌으로써 해결할 수 있다.

```
class L2 {
  static className = 'L2';
	constructor(config) {
		return tf.regularizers.l1l2(config)
	}
}
tf.serialization.registerClass(L2);
```
관련 스택오버플로우: https://stackoverflow.com/questions/64063914/unknown-regularizer-l2-in-tensorflowjs

3. use

- 표정에 따라 다른 결말 제공
- 아이들의 공감 능력 향상
- 아이들의 표현력 향상


![image](https://user-images.githubusercontent.com/90975718/170454863-5dfcbfa0-e6b0-4c0b-a265-c8c85087db7c.png)






