import fetch from 'isomorphic-fetch'
// import axios from 'axios';

export default class Authenticate {
  static init({ req, force }) {
    if(req) {
      if(req.session && req.session.token) {
        const { token, refreshToken } = req.session;
        return this._getUserData(token);
      }
      return new Promise((resolve) => {
        resolve({})
      })
    }
    else if(typeof window !== 'undefined') {
      // if(force) {
      //   this._removeLocalStore('token')
      // }
      const token = this._getLocalStore('token');
      // const token = localStorage.getItem('token');
      console.log('Auth: ', token)
      const refreshToken = this._getLocalStore('refreshToken');
      return this._getUserData(token || null);
    }
  }
  static _getUserData(token, refreshToken) {
    return fetch('http://localhost:3000/api/me', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        'x-token': token,
        'x-refresh-token': null,
      },
    })
      .then(res => res.json())
      .then(data => {
        if(data && data.token) {
          if(typeof window !== 'undefined')
            this._saveLocalStore('token', data.token);
          return data
        }
        return {}
      })
  }

  static async csrfToken() {
    return fetch('/auth/csrf', {
      credentials: 'same-origin'
    })
      .then(response => {
        if (response.ok) {
          return response
        } else {
          return Promise.reject(Error('Unexpected response when trying to get CSRF token'))
        }
      })
      .then(response => response.json())
      .then(data => data.csrfToken)
      .catch(() => Error('Unable to get CSRF token'))
  }

  static async signout() {
    // Signout from the server
    // const csrfToken = await this.csrfToken()
    // const formData = { _csrf: csrfToken }

    // Encoded form parser for sending data in the body
    // const encodedForm = Object.keys(formData).map((key) => {
    //   return encodeURIComponent(key) + '=' + encodeURIComponent(formData[key])
    // }).join('&')

    // Remove cached session data
    this._removeLocalStore('token');
    // this._removeLocalStore('refreshToken');
    return fetch('http://localhost:3000/api/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      // body: encodedForm,
      credentials: 'same-origin'
    })
      .then(() => {
        return true
      })
      .catch(() => Error('Unable to sign out'))
  }

  static _getLocalStore(name) {
    try {
      return localStorage.getItem(name)
    } catch (err) {
      return null
    }
  }

  static _saveLocalStore(name, data) {
    // localStorage.setItem(name, data)
    try {
      localStorage.setItem(name, JSON.stringify(data))
      return true
    } catch (err) {
      return false
    }
  }

  static _removeLocalStore(name) {
    try {
      localStorage.removeItem(name)
      return true
    } catch (err) {
      return false
    }
  }
}