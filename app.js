const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'ALBERT'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isReapeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "There's Nothing Holdin' Me Back",
      singer: 'Shawn Mendes',
      path: './assets/music/song1.mp3',
      image: 'https://m.media-amazon.com/images/M/MV5BMzdiMGRlM2EtY2I1My00MDU3LWFlMTQtZTFkODk5MDY0ZTc4XkEyXkFqcGdeQXVyNDQ5MDYzMTk@._V1_.jpg'
    },
    {
      name: 'Reality',
      singer: 'Lost Frequencies',
      path: './assets/music/song2.mp3',
      image: 'https://cdn.promodj.com/afs/5e10e1420585780ebed656f20dd1d80f11%3Aresize%3A2000x2000%3Asame%3A49dcd6'
    },
    {
      name: 'That Girl',
      singer: 'Olly Murs',
      path: './assets/music/song3.mp3',
      image: 'https://i1.sndcdn.com/artworks-000491162556-wa7tx6-t500x500.jpg'
    },
    {
      name: 'Summertime',
      singer: 'K-391',
      path: './assets/music/song4.mp3',
      image: 'https://i.ytimg.com/vi/9c2rW2Jd2DM/maxresdefault.jpg'
    },
    {
      name: 'Shape of You',
      singer: 'Ed Sheeran',
      path: './assets/music/song5.mp3',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXG1jprlP-eRZkUhK3odidFubrU_oH3g_ScA&usqp=CAU'
    },
  ],
  setConfig: function(key, value) {
    this.config[key] = value
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  render: function() {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
          <div class="thumb"
            style="background-image: url('${song.image}')" >
          </div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
      `
    })
    playlist.innerHTML = htmls.join('')
  },
  defineProperties: function() {
    Object.defineProperty(this, 'currentSong', {
      get: function() {
        return this.songs[this.currentIndex]
      }
    })
  },
  handleEvents() {
    const _this = this
    const cdWidth = cd.offsetWidth

    // Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)'}
    ], {
      duration: 10000, // 10 seconds
      iterations: Infinity
    })
    cdThumbAnimate.pause()

    // Xử lý phong to / thu nhỏ CD
    document.onscroll = function() {
      const crollTop = window.scrollY || document.documentElement.scrollTop
      const newCdWidth = cdWidth - crollTop

      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
      cd.style.opacity = newCdWidth / cdWidth
    }

    // Xử lý khi click play
    playBtn.onclick = function() {
      if (_this.isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    }

    // Khi song được play
    audio.onplay = function() {
        _this.isPlaying = true
        player.classList.add('playing')
        cdThumbAnimate.play()
    }

    // Khi song bị pause
    audio.onpause = function() {
        _this.isPlaying = false
        player.classList.remove('playing')
        cdThumbAnimate.pause()
    }

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function() {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
        progress.value = progressPercent
      }
    }

    // Xử lý khi tua song
    progress.onchange = function(e) {
      const seekTime = e.target.value / 100 * audio.duration
      audio.currentTime = seekTime
    }

    // Khi next song
    nextBtn.onclick = function() {
      if (_this.isRandom) {
        _this.playRandomSong()
      } else {
        _this.nextSong()
      }
      audio.play()
      _this.render()
      _this.scrollTopActiveSong()
    }

    // Khi prev song
    prevBtn.onclick = function() {
      if (_this.isRandom) {
        _this.playRandomSong()
      } else {
      _this.prevSong()
      }
      audio.play()
      _this.render()
      _this.scrollTopActiveSong()
    }

    // Xử lý bật / tắt random song
    randomBtn.onclick = function(e) {
      _this.isRandom = !_this.isRandom
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom)
    }

    // Xử lý lặp lại một song
    repeatBtn.onclick = function(e) {
      _this.isReapeat = !_this.isReapeat
      _this.setConfig('isReapeat', _this.isReapeat)
      repeatBtn.classList.toggle('active', _this.isReapeat)
    }

    // Xử lý next song khi audio ended
    audio.onended = function() {
      if (_this.isReapeat) {
        audio.play()
      } else {
        nextBtn.onclick()
      }
    }

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function(e) {
      const songNode = e.target.closest('.song:not(.active)')
      if (songNode || e.target.closest('.option')) {
        // Xử lý khi click vào song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index)
          _this.loadCurrentSong()
          audio.play()
          _this.render()
        }
        // Xử lý khi click vào song option
        if (e.target.closest('.option')) {
          console.log('Song option')
        }
      }
    }
  },
  scrollTopActiveSong: function() {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })

    }, 300)
  },
  loadCurrentSong: function() {

    heading.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path
  },
  loadConfig: function() {
    this.isRandom = this.config.isRandom
    this.isReapeat = this.config.isReapeat

    // Object.assign(this, this.config)
  },
  nextSong: function() {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }
    this.loadCurrentSong()
  },
  prevSong: function() {
    this.currentIndex--
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
  },
  playRandomSong: function() {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    } while (newIndex === this.currentIndex)

    this.currentIndex = newIndex
    this.loadCurrentSong()
  },
  start: function() {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig()

    // Định nghĩa các thuộc tính cho object
    this.defineProperties()

    // Lắng nghe / xử lý các sự kiện (DOM events)
    this.handleEvents()

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong()

    // Render playlist
    this.render()

    // Hiển thị trạng thái ban đầu của button repeat & random
    randomBtn.classList.toggle('active', this.isRandom)
    repeatBtn.classList.toggle('active', this.isReapeat)
  }
}

app.start()