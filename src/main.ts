import "@/index.css"
import { definePlugin, Utils } from "delta-comic-core"
import { api, image, share } from "./api/forks"
import axios from "axios"
import { inRange } from "lodash-es"
import { getBikaApiHeaders } from "./api/header"
import { pluginName } from "./symbol"
import { bika } from "./api"
import { bikaStore } from "./store"
import { BikaPage } from "./api/page"
import dayjs from 'dayjs'
import Card from "./components/card.vue"
import CommentRow from "./components/commentRow.vue"
const testAxios = axios.create({
  timeout: 10000,
  method: 'GET',
  validateStatus(status) {
    return inRange(status, 199, 499)
  },
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
      test: (fork, signal) => testAxios.get(`${fork}/dns`, { signal })
    }
  },
  image: {
    forks: {
      default: image
    },
    test: '/tobs/e735e94e-e595-4d63-99c5-61cbf0aefcb4.jpg'
  },
  content: {
    contentPage: {
      [BikaPage.contentType]: BikaPage
    },
    layout: {
      [BikaPage.contentType]: window.$layout.default
    },
    itemCard: {
      [BikaPage.contentType]: Card
    },
    commentRow: {
      [BikaPage.contentType]: CommentRow
    },
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
    console.log('[plugin bika] setup...', ins, ins.api?.api)
    if (ins.api?.api) {
      const f = ins.api.api
      const api = Utils.request.createAxios(() => f, {}, ins => {
        ins.interceptors.request.use(requestConfig => {
          for (const value of getBikaApiHeaders(requestConfig.url ?? '/', requestConfig.method!.toUpperCase())) requestConfig.headers.set(...value)
          return requestConfig
        })
        ins.interceptors.response.use(c => {
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
  }
})