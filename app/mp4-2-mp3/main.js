let ffmpeg;
const $video = document.querySelector('#test');
const $audio = document.querySelector('#test2');
const $log = document.querySelector('.logs');
const $file = document.querySelector('input[type=file]');
const $download = document.querySelector('#download');
const $progress = document.querySelector('#progress');
const accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZXh0IjoibGljaHVhbndlaS1IsInR5cGUiOiJjc3JmIn0.DGB_cjfVNJn7W6_m16mKnrr0l_Azl2S8t6v9-700qxg';
const cndName = 'demoproject-node';
const env = 'develop';
let downloadData = [];
const toMp4 = async (file) => {
  await ffmpeg.load();
  const { name } = file;
  const { createFFmpeg, fetchFile } = FFmpeg;
  ffmpeg.FS('writeFile', name, await fetchFile(file));
  await ffmpeg.run('-i', name, 'output.mp4');
  const data = ffmpeg.FS('readFile', 'output.mp4');
  downloadData = [
    new Blob([data.buffer], { type: 'video/mp4' }),
    `${Date.now()}.mp4`
  ];
  const url = window.URL.createObjectURL(downloadData[0]);
  $video.src = url;
  $video.load();
  $video.play();
  $video.style.display = '';
};
const toMp3 = async (file) => {
  // -vn -ar 44100 -ac 2 -ab 192 -f mp3
  await ffmpeg.load();
  const { name } = file;
  const { createFFmpeg, fetchFile } = FFmpeg;
  ffmpeg.FS('writeFile', name, await fetchFile(file));
  const args = `ffmpeg -i ${name} -vn -ar 44100 -ac 2 -ab 192 -f mp3 output.mp3`.replace(/^ffmpeg\s/, '').split(' ');
  await ffmpeg.run.apply(ffmpeg.run, args);
  // const data = ffmpeg.FS('readFile', 'output.mp4');
  const data = ffmpeg.FS('readFile', 'output.mp3');
  const blob = new Blob([data.buffer], { type: 'audio/mp3' });
  const mp3 = new File([blob], '1.mp3');
  downloadData = [
    blob,
    `${Date.now()}.mp3`
  ];
  // const url = window.URL.createObjectURL(downloadData[0]);
  // $audio.src = url;
  // $audio.load();
  // $audio.play();
  // $audio.style.display = '';
  $video.style.display = '';
  $video.src = URL.createObjectURL(file);

  uploadFile(mp3).then((url) => {
    console.log(url);
    audio2text(url);
  });
};
const audio2text = (url) => {
  const form = new FormData();
  form.append('url', url);
  fetch('/api/uploadmp3', {
    method: 'POST',
    body: form
  }).then(rs => rs.json()).then(rs => {
    console.log(rs);

    setTimeout(() => {
      getMp3Text(rs.data);
    }, 1000);
  });
};

let retryCount = 0;
const getMp3Text = (taskId) => {
  fetch(`/api/getmp3text?taskId=${taskId}`)
  .then(rs => rs.json())
  .then(rs => {
    console.log(rs);
    if (rs?.data?.data?.speechResult?.resultText) {
      const data = rs.data.data.speechResult.resultText;
      log(JSON.stringify(rs.data.data.speechResult));
      log(data);
      createVtt(rs.data.data.speechResult.detail);
    } else {
      if (retryCount > 10) {
        alert('语音识别超时或者失败');
      } else {
        setTimeout(() => {
          getMp3Text(taskId);
          retryCount += 1;
        }, 2000);
      }
    }
  });
};
const log = (msg) => {
    const p = document.createElement('p');
    p.innerHTML = msg;
    $log.appendChild(p);
    p.scrollIntoView({
        block: 'end',
    })
};
const downloadBlob = (blobData, filename) => {
  const dataURL = URL.createObjectURL(blobData);
  const a = document.createElement('a');
  const fn = filename || `s_${+new Date()}.md`;
  a.href = dataURL;
  a.setAttribute('download', fn);
  a.innerHTML = 'downloading...';
  a.style.display = 'none';
  document.body.appendChild(a);
  setTimeout(() => {
    a.click();
    document.body.removeChild(a);
  }, 66);
};
$download.onclick = () => {
    downloadData && downloadBlob(downloadData[0], downloadData[1]);
};
window.onload = () => {
  const { createFFmpeg, fetchFile } = FFmpeg;
  ffmpeg = createFFmpeg({
    // corePath: "./ffmpeg-core.js",
    log: false,
  });
  ffmpeg.setLogger(({ type, message }) => {
    /*
     * type can be one of following:
     *
     * info: internal workflow debug messages
     * fferr: ffmpeg native stderr output
     * ffout: ffmpeg native stdout output
     */
    log(message);
  });
  ffmpeg.setProgress(({ ratio }) => {
    console.log(ratio);
    $progress.innerHTML = (ratio * 100).toFixed(2) + '%';
    /*
     * ratio is a float number between 0 to 1.
     */
  });
};
const uploadFile = (file) => {
  const form = new FormData();
  form.append('files', file);
  form.append('name', cndName);
  form.append('env', env);
  return new Promise((resolve) => {
    fetch('/api/upload', {
      method: 'POST',
      body : form,
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    }).then(rs => rs.json()).then(rs => {
      resolve(rs.resource[0].url);
    });
  });
};
const timeFormat = (misec) => {
	const d = new Date('2021/01/01 00:00:00');
	d.setTime(d.valueOf() + Number(misec));
	return [
		d.getHours(),
		d.getMinutes(),
		d.getSeconds()
	].map(item => item.toString().padStart(2, '0')).join(':') + '.' + d.getMilliseconds().toString().padStart(3, '0');
};

const convertVtt = (list, arr = ['WEBVTT']) => {
	arr.push(
		list.map(item => {
			return [
				`\n${timeFormat(item.startTime)} --> ${timeFormat(item.endTime)}\n`,
				item.sentences.replace(/，|。$/, ''),
			].join('');
		}).join('\n')
	);
	return arr.join('\n\n\n');
};

function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

const dataURLtoFile = (str, filename, mime ) => {
  // const bstr = atob(str);
  // let n = bstr.length;
  // const u8arr = new Uint8Array(n);

  // while (n) {
  //     n -= 1;
  //     u8arr[n] = bstr.charCodeAt(n);
  // }
  const u8arr = str2ab(str);

  return new File([u8arr], filename, { type: mime });
};
const createVtt = (list) => {
  const text = convertVtt(list);
  log(text);
  // const blob = new Blob([text], {type: 'text/vtt'});
  // const f = new File([blob], 'demo.vtt');
  const f = dataURLtoFile(`\uFEFF${text}`, 'demo.vtt', 'text/vtt');
  console.log(f);
  // const filename = `${Date.now()}.vtt`;
  // downloadBlob(f, filename);

  setTimeout(() => {
    const track = document.createElement('track');
    track.kind = 'captions';
    // track.src = `/api/file/${filename}`;
    track.src = URL.createObjectURL(f);
    track.default = true;
    $video.appendChild(track);
    playerInit();
    $video.load();
    setTimeout(() => {
      player.fullscreen.enter();
      player.toggleCaptions()
      // $video.play();
      player.play();
    }, 1000);
  }, 100);
  // const reader = new FileReader();
  // reader.readAsText(f);
  // reader.onload = () => {
  //   console.log(reader.result);
  // }
  // uploadFile(f).then(url => {
  //   const track = document.createElement('track');
  //   track.kind = 'captions';
  //   track.src = url;
  //   $video.appendChild(track);
  //   $video.load();
  //   $video.play();
  // });
}
const playerInit = () => {
  window.player = new Plyr('#test', {
    title: 'Example Title',
    captions: {
      active: true,
      defaultActive: true,
    }
  });
};
const playMp4 = (file) => {
  const blobUrl = URL.createObjectURL(file);
  $video.style.display = '';
  $video.src = blobUrl;
  playerInit();
  setTimeout(() => {
    $video.load();
    $video.play();
    player.fullscreen.enter();
    player.toggleCaptions()
  }, 1000);
};
$file.onchange = async(e) => {
  const file = e.target.files[0];
  // uploadFile(file);
  const v = document.querySelector('[name=converType]:checked').value;
  if (v === 'mp3') {
    toMp3(file);
  } else if(v==='mp4') {
    // toMp4(file);
    playMp4(file);
  }
  // const url = await uploadFile(file);
  // console.log(url);
};
