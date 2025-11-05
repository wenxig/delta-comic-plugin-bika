import "@/index.css"
import { coreModule, definePlugin, requireDepend, uni, Utils } from "delta-comic-core"
import { api, image, share } from "./api/forks"
import axios from "axios"
import { inRange } from "es-toolkit/compat"
import { getBikaApiHeaders } from "./api/header"
import { pluginName } from "./symbol"
import { bika } from "./api"
import { bikaStore } from "./store"
import { BikaPage } from "./api/page"
import dayjs from 'dayjs'
import Card from "./components/card.vue"
import CommentRow from "./components/commentRow.vue"
import User from "./components/user.vue"
import Tabbar from "./components/tabbar.vue"
import { MD5 } from "crypto-js"
import Edit from "./components/edit.vue"
import type { AxiosResponse } from "axios"
import { config } from "./config"
const { layout } = requireDepend(coreModule)
const testAxios = axios.create({
  timeout: 10000,
  method: 'GET',
  validateStatus(status) {
    return inRange(status, 199, 499)
  }
})
testAxios.interceptors.response.use(undefined, Utils.request.utilInterceptors.createAutoRetry(testAxios, 2))
definePlugin({
  name: pluginName,
  api: {
    api: {
      forks: () => api,
      test: (fork, signal) => testAxios.get(fork, { signal })
    },
    share: {
      forks: () => share,
      test: (fork, signal) => testAxios.get(`${fork}/pic/share/set/?c=685d566e5709fd7e61ea2c4f`, { signal })
    }
  },
  image: {
    forks: {
      default: image
    },
    test: '/tobs/6369917e-95ee-42ca-a187-3cac73e5b68b.jpg'
  },
  user: {
    card: User,
    edit: Edit,
    syncFavourite: {
      download() {
        const stream = bika.api.user.createFavouriteComicStream()
        return stream.nextToDone()
      },
      upload(items) {
        return Promise.all(items.map(v => bika.api.comic.favouriteComic(v.id).then(r => {
          if (r.action === 'un_favourite') {
            return bika.api.comic.favouriteComic(v.id)
          }
        })))
      },
    }
  },
  content: {
    contentPage: {
      [BikaPage.contentType]: BikaPage
    },
    layout: {
      [BikaPage.contentType]: layout.Default
    },
    itemCard: {
      [BikaPage.contentType]: Card
    },
    commentRow: {
      [BikaPage.contentType]: CommentRow
    }
  },
  auth: {
    passSelect: async () => {
      console.log(bikaStore.loginData.value)
      return (bikaStore.loginData.value.email !== '') ? 'logIn' : false
    },
    async logIn(by) {
      if (bikaStore.loginData.value.email !== '') var form = bikaStore.loginData.value
      else var form = bikaStore.loginData.value = await by.form({
        email: {
          type: 'string',
          info: '用户名'
        },
        password: {
          type: 'string',
          info: '密码'
        }
      })
      const res = await bika.api.auth.login(form)
      console.log(res)
      bikaStore.loginToken.value = res.token
    },
    async signUp(by) {
      const form = await by.form({
        email: {
          type: 'string',
          info: '用户名'
        },
        name: {
          type: 'string',
          info: '展示用户名'
        },
        password: {
          type: 'string',
          info: '密码'
        },
        birthday: {
          type: 'date',
          info: '生日'
        },
        gender: {
          type: 'radio',
          comp: 'radio',
          info: '性别',
          selects: [{
            label: '男',
            value: 'm'
          }, {
            label: '女',
            value: 'f'
          }, {
            label: '隐藏',
            value: 'bot'
          }]
        },
        question1: {
          type: 'string',
          info: '密保问题1'
        },
        answer1: {
          type: 'string',
          info: '密保答案1'
        },
        question2: {
          type: 'string',
          info: '密保问题2'
        },
        answer2: {
          type: 'string',
          info: '密保答案2'
        },
        question3: {
          type: 'string',
          info: '密保问题3'
        },
        answer3: {
          type: 'string',
          info: '密保答案3'
        },
      })
      await bika.api.auth.signUp({
        ...form,
        birthday: dayjs(form.birthday).format('YYYY-MM-DD'),
        gender: <bika.user.Gender>form.gender
      })
    }
  },
  onBooted: ins => {
    console.log('setup...', ins, ins.api?.api)
    if (ins.api?.api) {
      const f = ins.api.api
      const api = Utils.request.createAxios(() => f, { }, ins => {
        ins.interceptors.request.use(requestConfig => {
          for (const value of getBikaApiHeaders(requestConfig.url ?? '/', requestConfig.method!.toUpperCase())) requestConfig.headers.set(...value)
          return requestConfig
        })
        ins.interceptors.response.use(undefined, err => {
          if (err?.response && err.response.data.error == '1014') return Promise.resolve((<AxiosResponse>{ data: false, config: err.config, headers: err.response?.headers, status: 200, statusText: '200', request: err.request })) // only /comic/:id
          return Promise.reject(err)
        })
        ins.interceptors.response.use(c => {
          if (!c.data.data && c.config.method?.toUpperCase() == 'GET')
            throw new Error('non-data response was been gotten.')
          c.data = c.data.data
          return c
        })
        return ins
      })
      bikaStore.api.value = api
      Utils.eventBus.SharedFunction.define(bika.api.search.getRandomComic, pluginName, 'getRandomProvide')
    }
    if (ins.api?.share) {
      const f = ins.api.share
      const share = Utils.request.createAxios(() => f)
      bikaStore.share.value = share
    }
  },
  otherProgress: [{
    name: '获取初始化信息',
    async call(setDescription) {
      setDescription('请求网络中')
      initData = await bika.api.search.getInit()
      uni.content.ContentPage.setCategories(pluginName, ...initData.categories.map(v => ({
        title: v.title,
        namespace: '',
        search: {
          methodId: 'category',
          input: v.title,
          sort: bika.sorts[0].value
        }
      })))
      setDescription('成功')
    },
  }, {
    name: '获取用户 & 签到',
    async call(setDescription) {
      setDescription('请求网络中')
      try {
        if (!initData.isPunched) await bika.api.user.punch()
      } catch { }
      const [user, collections] = await Promise.all([
        bika.api.user.getProfile(),
        bika.api.search.getCollections()
      ])
      uni.user.User.userBase.set(pluginName, user)
      bikaStore.collections.value = collections
      uni.content.ContentPage.setTabbar(pluginName, ...collections.map(c => ({
        title: c.title,
        id: MD5(c.title).toString(),
        comp: Tabbar
      })))
      setDescription('成功')
    },
  }],
  search: {
    methods: {
      keyword: {
        defaultSort: bika.sorts[0].value,
        name: '关键词',
        sorts: bika.sorts,
        getStream(input, sort: bika.SortType) {
          return bika.api.search.utils.createKeywordStream(input, sort)
        },
        async getAutoComplete() {
          return []
        }
      },
      author: {
        defaultSort: bika.sorts[0].value,
        name: '作者',
        sorts: bika.sorts,
        getStream(input, sort: bika.SortType) {
          return bika.api.search.utils.createAuthorStream(input, sort)
        },
        async getAutoComplete() {
          return []
        }
      },
      category: {
        defaultSort: bika.sorts[0].value,
        name: '分类',
        sorts: bika.sorts,
        getStream(input, sort: bika.SortType) {
          return bika.api.search.utils.createCategoryStream(input, sort)
        },
        async getAutoComplete(input) {
          return initData.categories.filter(v => v.title.includes(input)).map(v => ({ text: v.title, value: v.title }))
        }
      },
      tag: {
        defaultSort: bika.sorts[0].value,
        name: '标签',
        sorts: bika.sorts,
        getStream(input, sort: bika.SortType) {
          return bika.api.search.utils.createTagStream(input, sort)
        },
        async getAutoComplete() {
          return []
        }
      }
    },
    hotPage: {
      levelBoard: bika.api.search.getLevelboard()
    }
  },
  config: [
    config
  ]
})
let initData: bika.search.Init