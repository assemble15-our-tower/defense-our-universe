import { CLIENT_VERSION } from './Constants.js';

const token = sessionStorage.getItem('authorization');

const serverSocket = io(`http://localhost:9999`, {
  query: {
    clientVersion: CLIENT_VERSION,
  },
  auth: {
    token, // 세션스토리지에서 토큰 가져오기
  },
});

let userId = null;

serverSocket.on('connection', (data) => {
  console.log('connection: ', data);
  userId = data.uuid;
});

serverSocket.on('response', (data) => {
  console.log(data);
});

const sendEvent = (handlerId, payload) => {
  serverSocket.emit('event', {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
  console.log('sendEvent의 payload 내용: ', payload)
};

export { sendEvent };
