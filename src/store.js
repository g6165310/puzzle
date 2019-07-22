import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    puzzleCol:3,
    puzzleRow:3,
    puzzles: [],
  },
  mutations: {
    INITPOS(state, payload) {
      state.puzzles.push(payload)
      state.puzzles[payload.index].combition=[]
    },
    NEIGHBORS(state, payload){
      state.puzzles[payload.index].neighbor=payload.data
    },
    NEWPOS(state, payload){
      state.puzzles[payload.index].top = payload.top
      state.puzzles[payload.index].left = payload.left
    },
    COMBITION(state, payload){
      state.puzzles[payload.index].combition.push(payload.combineId)
    },
    IMGINFO(state,payload){
      state.puzzles[payload.index].width = payload.width
      state.puzzles[payload.index].height = payload.height
    },
    RESET(state){
      state.puzzles = []
    }
  },
  actions: {
    setInitPos(context, payload) {
      context.commit('INITPOS', payload)
    },
    setNeighbors(context, payload){
      context.commit('NEIGHBORS', payload)
    },
    setImgInfo(context,payload){
      context.commit('IMGINFO', payload)
    },
    updatePos(context, payload){
      context.commit('NEWPOS', payload)
    },
    updateCombination(context, payload){
      context.commit('COMBITION', payload)
    },
  },
  getters: {
    puzzles: (state) => { return state.puzzles },
    puzzleCol: (state) => { return state.puzzleCol },
    puzzleRow: (state) => { return state.puzzleRow },
  }
})
