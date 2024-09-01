console.log("JavaScript Running...");
let cardContainer = document.querySelector(".cardConatiner");
let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
let currentSong = new Audio();
let play = document.querySelector("#play");
let songs;
let curfolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Calculate hours, minutes, and remaining seconds
  let hrs = Math.floor(seconds / 3600);
  let mins = Math.floor((seconds % 3600) / 60);
  let secs = Math.floor(seconds % 60);

  // Format with leading zeros if necessary
  mins = mins.toString().padStart(2, "0");
  secs = secs.toString().padStart(2, "0");

  // If duration is more than 59 minutes, include hours
  if (hrs > 0) {
    hrs = hrs.toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  } else {
    return `${mins}:${secs}`;
  }
}

async function getSongs(folder) {
  curfolder = folder;
  try {
    let data = await fetch(`/${folder}/`);
    let response = await data.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
      const element = as[i];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split(`/${folder}/`)[1]);
      }
    }

    songUl.innerHTML = "";
    for (const song of songs) {
      songUl.innerHTML += `
        <li>
          <div class="det">
            <i class="ri-music-2-line"></i>
            <div class="info">
              <div class="sdet">${song.replaceAll("%20", " ")}</div>
            </div>
          </div>
          <div class="playNow">
            <span>Play Now</span>
            <i class="ri-play-circle-line"></i>
          </div>
        </li>`;
    }

    // Attach event listeners to each song
    Array.from(
      document.querySelector(".songList").getElementsByTagName("li")
    ).forEach((e) => {
      e.addEventListener("click", (element) => {
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        play.classList.remove("ri-play-line");
        play.classList.add("ri-pause-line");
      });
    });

    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/music/"+track)
  currentSong.src = `/${curfolder}/` + track;
  if (!pause) {
    currentSong.play();
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let data = await fetch(`/music/`);
  let response = await data.text();
  // console.log(response)
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");

  let firstMatchSkipped = false;

  let array = Array.from(anchors);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];

    if (e.href.includes("/music") && !e.href.includes(".htaccess")) {
      // Skip the first match
      if (!firstMatchSkipped) {
        firstMatchSkipped = true;
        continue; // Use continue instead of return
      }

      let folder = e.href.split("/").slice(-1)[0];
      console.log(folder);

      // Fetch metadata
      let metadata = await fetch(`/music/${folder}/info.json`);
      let metadataResponse = await metadata.json();
      // console.log(metadataResponse);

      cardContainer.innerHTML += ` <div data-folder="${folder}" class="card">
              <div class="play">
                <i class="ri-play-large-fill"></i>
              </div>

              <img
                src="/music/${folder}/cover.jpeg"
                alt=""
              />
              <h2>${metadataResponse.title}</h2>
              <p>${metadataResponse.description}</p>
            </div>`;
    }
  }

  // Ensure elements are present in the DOM before adding event listeners
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    // console.log(e);
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`music/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
      play.classList.remove("ri-play-line");
      play.classList.add("ri-pause-line");

      // Handle song loading or playback
    });
  });

  // console.log(anchors)
}

async function main() {
  //get all songs
  await getSongs(`music/${folder}`);
  playMusic(songs[0], true);
  // console.log(songs)

  //display album
  displayAlbums();

  // console.log(Array.from(document.querySelector(".songList").getElementsByTagName('li')))

  //play prev next
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.classList.remove("ri-play-line");
      play.classList.add("ri-pause-line");
    } else {
      currentSong.pause();
      play.classList.remove("ri-pause-line");
      play.classList.add("ri-play-line");
    }
  });
  //timeupdate
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime,currentSong.duration)
    document.querySelector(".songTime").innerHTML = `${formatTime(
      currentSong.currentTime
    )}/${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //add event to seek bar
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    // console.log((e.offsetX / e.target.getBoundingClientRect().width) * 100);
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  //add hamburegr
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = -1 + "%";
    document.querySelector(".left").style.top = -1 + "%";
  });
  //add close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = -120 + "%";
    // document.querySelector(".left").style.top = 10 + "%";
  });

  //prev and next
  prev.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    // console.log(index)
    // console.log(songs)
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
    playMusic(songs[index - 1]);
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    // console.log(index)
    // console.log(songs)
    if (index + 1 >= length) {
      playMusic(songs[index + 1]);
    }
  });

  //volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      // console.log(e.target.value)
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  //mute
  document.getElementById("volumeIcon").addEventListener("click", function (e) {
    const icon = e.target;
    if (icon.classList.contains("ri-volume-up-line")) {
      icon.classList.remove("ri-volume-up-line");
      icon.classList.add("ri-volume-mute-line");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      icon.classList.remove("ri-volume-mute-line");
      icon.classList.add("ri-volume-up-line");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
