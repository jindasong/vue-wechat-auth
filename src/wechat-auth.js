/**
 * ------------------------------------------------------------------
 * 微信授权
 * @author SongJinDa <310676645@qq.com>
 * @date 17/3/26
 * ------------------------------------------------------------------
 */

class WeChatAuth {
  constructor (config) {
    let defaultConfig = {
      appid: '',
      responseType: 'code',
      scope: 'snsapi_base ',
      getCodeCallback: () => {}
    }
    this.config = Object.assign(defaultConfig, config)
  }

  openAuthPage (redirectUri = window.location.href) {
    let redirectUriArr = redirectUri.split('#')
    window.sessionStorage.setItem('redirect_path', redirectUriArr[1])
    redirectUri = encodeURIComponent(redirectUriArr[0])
    this.removeAccessToken()
    this.removeAuthCode()
    let authPageBaseUri = 'https://open.weixin.qq.com/connect/oauth2/authorize'
    let authParams = `?appid=${this.config.appid}&redirect_uri=${redirectUri}&response_type=${this.config.responseType}&scope=${this.config.scope}#wechat_redirect`
    window.location.href = authPageBaseUri + authParams
  }

  setAuthCode (code) {
    if (!code) return false
    window.sessionStorage.setItem('auth_code', code)
    return true
  }

  getAuthCode () {
    let codeValue = window.sessionStorage.getItem('auth_code')
    if (!codeValue) return ''
    return codeValue
  }

  removeAuthCode () {
    window.sessionStorage.removeItem('auth_code')
  }

  removeUrlCodeQuery () {
    let location = window.location
    let search = location.search
    if (search) {
      search = search.substr(1)
    }
    let href = location.origin
    let pathName = location.pathname
    if (pathName) {
      href += pathName
    }
    let searchArr = search.split('&').filter(item => {
      if (item.indexOf('code=') !== -1) {
        return false
      }
      if (item.indexOf('state=') !== -1) {
        return false
      }
      return true
    })
    if (searchArr.length > 0) {
      href += '?' + searchArr.join('&')
    }
    let hash = location.hash
    if (hash) {
      href += hash
    }
    window.location.href = href
  }

  setAccessToken (accessToken) {
    if (!accessToken) return false
    window.localStorage.setItem('access_token', accessToken)
    return true
  }

  getAccessToken () {
    return window.localStorage.getItem('access_token')
  }

  removeAccessToken () {
    window.localStorage.removeItem('access_token')
  }

  next (next) {
    let self = this
    return (accessToken, to) => {
      if (accessToken) {
        self.setAccessToken(accessToken)
        to
          ? next(to)
          : next()
      } else {
        self.removeAccessToken()
        to && next(to)
      }
      self.removeAuthCode()
    }
  }

  getCodeCallback (next) {
    return this.config.getCodeCallback(this.getAuthCode(), this.next(next), window.sessionStorage.getItem('redirect_path'))
  }
}

export default WeChatAuth
