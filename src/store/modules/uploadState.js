const uploadState = {
  state: {
    _isUploading: false,
  },
  mutations: {
    SET_UPLOADING: (state, val) => {
      state._isUploading = val
    },
  },
}

export default uploadState