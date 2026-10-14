const getters = {
  token: state => state.user.token,
  userId: state => state.user.userId,
  platform: state => state.app.platform,
  locale: state => state.app.locale
}

export default getters
