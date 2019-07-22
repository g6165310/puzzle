<template>
  <div id="app">
    <section class="game" v-show="!isCompelete" key="game">
      <div class="title">請完成這幅《清明上河圖》</div>
      <div
        class="puzzle"
        v-for="(puzzle,index) in puzzles"
        :key="index"
        :style="{top:`${puzzle.top}px`,left:`${puzzle.left}px`}"
        @mousedown="mousedownHandler($event,index)"
        @mouseup="checkNeighbors($event,currentCombination)"
        :data-index="index"
        :class="{isSelected:currentCombination.indexOf(index)!=-1}"
      >
        <img :src="`./img/Puzzle-${puzzle.srcIdx}.png`" ref="img">
      </div>
      <div class="btn-reset" @click="reset()">重新排列</div>
    </section>
    <section class="result" v-if="isCompelete" key="result">
      <img src="./assets/img-Qingming.png" alt>
      <div class="content">
        <h2>清院本清明上河圖</h2>
        <h5>陳枚、孫祜、金昆、戴洪、程志道</h5>
        <span>清高宗乾隆元年（1736）</span>
        <p>宋張澤端（活動於西元十二世紀前期）「清明上河圖」是畫史中寫實風俗畫的一件傑作，歷代臨仿者甚多，在故宮即藏有七種不同的本子，其中就屬清院本「清明上河圖」最為有名。</p>
        <p>此卷為乾隆元年（一七三六）由宮廷畫院畫師陳枚、孫祜、金昆、戴洪、程志道等五人合繪。 此卷設色鮮麗，用筆圓熟，界畫橋樑、屋宇及人物皆十分細膩嚴謹，是院畫中之極精者。所畫事物甚多，雖失去了宋代古制，但也足以代表明清之際北京風物。</p>
        <div class="restart-btn" @click="reset()">再玩一次</div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { setTimeout } from "timers";
export default {
  name: "app",
  data() {
    return {
      col: 3,
      row: 3,
      puzzles: [],
      currentIdx: null,
      startX: 0,
      startY: 0,
      combinations: [],
      currentCombination: [],
      isCompelete: false
    };
  },
  computed: {},
  methods: {
    init() {
      let pieces = this.col * this.row;
      let winW = document.documentElement.clientWidth;
      let winH = document.documentElement.clientHeight;
      let num = this.col;
      let vm = this;
      for (let i = 0; i < pieces; i++) {
        let top = 100 + (winH - 380) * Math.random();
        let left = 100 + (winW - 380) * Math.random();
        let neighbors = vm.setNeighbors(i, num, pieces);
        vm.puzzles.push({
          index: i,
          srcIdx: i + 1,
          top,
          left,
          neighbors
        });
      }
    },
    setNeighbors(index, num, pieces) {
      let arr = [];
      switch (index % 3) {
        case 0:
          arr = [index - num, index + 1, index + num];
          break;
        case num - 1:
          arr = [index - num, index - 1, index + num];
          break;
        default:
          arr = [index - num, index - 1, index + 1, index + num];
      }
      arr = arr.filter(i => {
        return i >= 0 && i < pieces;
      });
      return arr;
    },
    adjustImg() {
      let dom = this.$el.querySelectorAll(".puzzle img");
      for (let i = 0; i < dom.length; i++) {
        let imgH = dom[i].naturalHeight;
        let imgW = dom[i].naturalWidth;
        if (imgW > 180) {
          if (i % 3 != 0) {
            dom[i].style.left = "-27px";
          }
        }
        if (imgH > 180 && i > this.col - 1) {
          dom[i].style.top = "-27px";
        }
      }
    },
    mousedownHandler(e, index) {
      e.stopPropagation();
      this.currentIdx = index;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.currentCombination = this.setCurrentCombination();
      document.onmousemove = this.move;
    },
    move(e) {
      e.stopPropagation();
      e.preventDefault();
      const vm = this;
      let moveX = e.clientX - this.startX;
      let moveY = e.clientY - this.startY;
      this.startX = e.clientX;
      this.startY = e.clientY;
      let distX = this.startX - this.puzzles[this.currentIdx].left;
      let distY = this.startY - this.puzzles[this.currentIdx].top;
      let allInRange = true;
      for (let i = 0; i < vm.currentCombination.length; i++) {
        if (
          !vm.checkInWindow(
            vm.puzzles[vm.currentCombination[i]].top + moveY,
            vm.puzzles[vm.currentCombination[i]].left + moveX
          )
        ) {
          allInRange = false;
          break;
        }
      }
      if (allInRange) {
        for (let i = 0; i < vm.currentCombination.length; i++) {
          vm.puzzles[vm.currentCombination[i]].top =
            vm.puzzles[vm.currentCombination[i]].top + moveY;
          vm.puzzles[vm.currentCombination[i]].left =
            vm.puzzles[vm.currentCombination[i]].left + moveX;
        }
      } else {
        document.onmousemove = null;
        vm.currentCombination = [];
      }

      document.onmouseup = function() {
        document.onmousemove = null;
      };
    },
    setCombination(currentIdx, neighborIdx) {
      let set = new Set();
      const vm = this;
      let targetCombination;
      let neighborCombination;
      vm.combinations.forEach(combination => {
        if (combination.has(neighborIdx)) {
          neighborCombination = combination;
        }
        if (combination.has(currentIdx)) {
          targetCombination = combination;
        }
      });
      if (neighborCombination === targetCombination && neighborCombination) {
        return;
      } else if (neighborCombination && targetCombination) {
        neighborCombination.add(...targetCombination);
        vm.combinations.splice(vm.combinations.indexOf(targetCombination), 1);
      }
      if (neighborCombination) {
        neighborCombination.add(currentIdx);
      } else if (targetCombination) {
        targetCombination.add(neighborIdx);
      } else {
        set.add(currentIdx).add(neighborIdx);
        vm.combinations.push(set);
      }
    },
    setCurrentCombination() {
      const vm = this;
      for (let i = 0; i < vm.combinations.length; i++) {
        if (vm.combinations[i].has(vm.currentIdx)) {
          return [...vm.combinations[i]];
        }
      }
      return [vm.currentIdx];
    },
    checkInWindow(top, left) {
      let winW = document.documentElement.clientWidth;
      let winH = document.documentElement.clientHeight;
      if (top > 100 && top < winH - 280 && (left > 100 && left < winW - 280)) {
        return 1;
      } else {
        return 0;
      }
    },
    checkNeighbors(e) {
      const vm = this;
      vm.currentCombination.forEach(index => {
        let neighbors = vm.puzzles[index].neighbors;
        for (let i = 0; i < neighbors.length; i++) {
          let tgtop = vm.puzzles[index].top; //當前點擊拖拉的拼圖的top
          let tgleft = vm.puzzles[index].left; //當前點擊拖拉的拼圖的left
          let nbtop = vm.puzzles[neighbors[i]].top;
          let nbleft = vm.puzzles[neighbors[i]].left;
          let offsetX = 0;
          let offsetY = 0;
          let hasToCombine = true;
          switch (true) {
            case index - neighbors[i] == -1 &&
              (Math.abs(tgtop - nbtop) < 10 &&
                Math.abs(tgleft - nbleft) - 180 < 10):
              offsetX = nbleft - 180 - tgleft;
              offsetY = nbtop - tgtop;
              break;
            case index - neighbors[i] == 1 &&
              (Math.abs(tgtop - nbtop) < 10 &&
                Math.abs(tgleft - nbleft) - 180 < 10):
              offsetX = nbleft + 180 - tgleft;
              offsetY = nbtop - tgtop;
              break;
            case index - neighbors[i] == -3 &&
              (Math.abs(tgtop - nbtop) - 180 < 10 &&
                Math.abs(tgleft - nbleft) < 10):
              offsetX = nbleft - tgleft;
              offsetY = nbtop - 180 - tgtop;
              break;
            case index - neighbors[i] == 3 &&
              (Math.abs(tgtop - nbtop) - 180 < 10 &&
                Math.abs(tgleft - nbleft) < 10):
              offsetX = nbleft - tgleft;
              offsetY = nbtop + 180 - tgtop;
              break;
            default:
              hasToCombine = false;
          }
          if (hasToCombine) {
            vm.currentCombination.forEach(index => {
              vm.puzzles[index].top = vm.puzzles[index].top + offsetY;
              vm.puzzles[index].left = vm.puzzles[index].left + offsetX;
            });
            vm.setCombination(index, neighbors[i]);
          }
        }
      });
      document.onmouseup = function() {
        document.onmousemove = null;
        vm.currentCombination = [];
      };
      vm.checkCompelete();
    },
    checkCompelete() {
      const vm = this;
      if (vm.combinations.length != 0 && vm.combinations[0].size === 9) {
        vm.isCompelete = true;
      }
    },
    reset() {
      this.puzzles = [];
      this.combinations = [];
      this.isCompelete = false;
      this.showContent = false;
      this.init();
    }
  },
  mounted() {
    const vm = this
    setTimeout(()=>{
      vm.adjustImg()
    },100)
  },
  created() {
    this.init();
  }
};
</script>

<style lang="scss">
@import "./reset.scss";
@import url("https://fonts.googleapis.com/css?family=Noto+Serif+TC:400,700&subset=chinese-traditional");
#app {
  font-family: "Noto Serif TC", serif;
  width: 100vw;
  height: 100vh;
  color: #ffffff;
  &::before {
    position: absolute;
    content: "";
    height: 100vh;
    width: 100vw;
    filter: blur(5px) brightness(50%);
    background-image: url("./assets/bg.png");
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
    background-color: #000000;
  }
}
.title {
  width: 100%;
  text-align: center;
  position: absolute;
  margin-top: 47px;
  font-size: 36px;
  font-weight: 700;
}
.btn-reset {
  position: absolute;
  width: 350px;
  height: 67px;
  text-align: center;
  line-height: 67px;
  font-size: 24px;
  font-weight: 700;
  border: 2px solid #fff;
  bottom: 31px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  &:hover {
    background-color: #fff;
    color: rgba(0, 0, 0, 1);
    border: 2px solid #000;
  }
}
.puzzle {
  position: absolute;
  width: 180px;
  height: 180px;
  img {
    position: absolute;
  }
}
.result {
  height: 100%;
  width: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  img {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    position: absolute;
    z-index: 10;
    animation: offsetLeft 2s;
    animation-fill-mode: forwards;
    animation-delay: 3s;
  }
  .content {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    position: absolute;
    width: 350px;
    z-index: 0;
    padding: 32px 0px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    animation: offsetRight 2s;
    animation-fill-mode: forwards;
    animation-delay: 3s;
    opacity: 0;
  }
}
h2 {
  font-size: 36px;
  line-height: 51px;
  font-weight: bold;
  margin-bottom: 32px;
}
h5,
span {
  line-height: 23px;
  font-weight: bold;
  margin-bottom: 8px;
}
span {
  margin-bottom: 32px;
  display: block;
}
p {
  line-height: 23px;
  margin-bottom: 32px;
}
.restart-btn {
  background-color: #fff;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  width: 100%;
  height: 67px;
  font-size: 24px;
  line-height: 35px;
  cursor: pointer;
  &:hover {
    background-color: #000;
    color: #fff;
  }
}
.isSelected {
  z-index: 10;
  box-shadow: 1px 0px 20px #fff, -1px 0px 20px #fff, 0px 1px 20px #fff,
    0px -1px 20px #fff;
}
// * {
//   color: hsla(210, 100%, 100%, 0.9) !important;
//   background: hsla(210, 100%, 50%, 0.5) !important;
//   outline: solid 0.25rem hsla(210, 100%, 100%, 0.5) !important;

//   box-shadow: none !important;
//   filter: none !important;
// }
.offsetLeft-enter-active {
  animation: offsetLeft 5s;
}
.offsetRight-enter-active {
  animation: offsetRight 2s;
}
@keyframes offsetLeft {
  0% {
    left: 0;
  }
  100% {
    left: -350px;
  }
}
@keyframes offsetRight {
  0% {
    opacity: 0;
    right: 0;
  }
  100% {
    opacity: 1;
    left: 595px;
  }
}
</style>
