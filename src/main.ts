import "@/index.css"
import { definePlugin, Utils } from "delta-comic-core"
import { api, image, share } from "./api/forks"
import axios from "axios"
import { inRange } from "lodash-es"
import { getBikaApiHeaders } from "./api/header"
import { pluginName } from "./symbol"
import { bika } from "./api"
import { bikaStore } from "./store"
const testAxios = axios.create({
  timeout: 10000,
  method: 'GET',
  validateStatus(status) {
    return inRange(status, 199, 499)
  },
})
const ins = definePlugin({
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
    }
  }
})
ins.then(ins => {
  if (ins.api?.api) {
    const f = ins.api.api
    const axios = Utils.request.createAxios(() => f, {}, ins => {
      ins.interceptors.request.use(requestConfig => {
        for (const value of getBikaApiHeaders(requestConfig.url ?? '/', requestConfig.method!.toUpperCase())) requestConfig.headers.set(...value)
        return requestConfig
      })
      return ins
    })
    bikaStore.api.value = axios
    Utils.eventBus.SharedFunction.define(bika.api.search.getRandomComic, pluginName, 'getRandomProvide')
  }
})